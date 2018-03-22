import { PgPool } from 'co-postgres-queries';
import config from 'config';
import co from 'co';
import get from 'lodash.get';

import History from '../../lib/models/History';
import JanusAccount from '../../lib/models/JanusAccount';
import Community from '../../lib/models/Community';
import searchArticleFactory from '../../lib/services/searchArticle';
import getRedisClient from '../../lib/utils/getRedisClient';
import articleParser from '../../lib/services/articleParser';
import retrieveArticleFactory from '../../lib/services/retrieveArticle';
import retrieveArticleParser from '../../lib/services/retrieveArticleParser';
import ebscoSession from '../../lib/services/ebscoSession';
import ebscoAuthentication from '../../lib/services/ebscoAuthentication';
import ebscoTokenFactory from '../../lib/services/ebscoToken';
import getMissingResults, {
    getResultsIdentifiers,
} from '../../lib/services/getMissingResults';
import getSearchAlertMail from '../../lib/services/getSearchAlertMail';
import sendMail from '../../lib/services/sendMail';
import { alertLogger } from '../../lib/services/logger';

function* main() {
    alertLogger.info('Starting');
    const db = new PgPool({
        user: config.postgres.user,
        password: config.postgres.password,
        host: config.postgres.host,
        port: config.postgres.port,
        database: config.postgres.database,
    });
    const redis = getRedisClient();
    const historyQueries = History(db);
    const communityQueries = Community(db);
    const janusAccountQueries = JanusAccount(db);
    const allCommunities = yield communityQueries.selectPage();
    const allDomains = allCommunities.map(({ name }) => name);
    const communityByName = allCommunities.reduce(
        (acc, c) => ({
            ...acc,
            [c.name]: c,
        }),
        {},
    );

    const ebscoToken = ebscoTokenFactory(
        redis,
        'guest',
        allDomains,
        ebscoSession,
        ebscoAuthentication,
    );

    const { count } = yield historyQueries.countAlertToExecute({
        date: new Date(),
    });

    alertLogger.info(`Detecting new results for ${count} alerts`);
    if (count === '0') {
        return;
    }
    const pages = Math.max(count / 10);
    for (var i = 0; i <= pages; i++) {
        alertLogger.info(
            `Sending alert from ${10 * i} to ${10 * (i + 1)} on ${count}`,
        );
        try {
            const histories = yield historyQueries.selectAlertToExecute({
                date: new Date(),
                limit: 10,
                offset: 10 * i,
            });
            yield histories.map(function*({
                event: { queries, limiters, activeFacets, domain },
                id,
                nb_results,
                last_results,
                user_id,
            }) {
                alertLogger.info('alert for', {
                    queries,
                    limiters,
                    activeFacets,
                    domain,
                });
                const community = communityByName[domain];
                const searchArticle = searchArticleFactory(
                    community,
                    ebscoToken,
                );

                const retrieveArticle = retrieveArticleFactory(
                    community,
                    ebscoToken,
                );
                const result = yield searchArticle(
                    {
                        queries,
                        limiters,
                        activeFacets,
                        resultsPerPage: 1,
                    },
                    'title',
                );
                const newTotalHits = get(
                    result,
                    'SearchResult.Statistics.TotalHits',
                    0,
                );
                if (nb_results === newTotalHits) {
                    alertLogger.info('No new results');
                    return;
                }

                const fullResult = yield searchArticle(
                    {
                        queries,
                        limiters,
                        activeFacets,
                        resultsPerPage: 100,
                    },
                    'brief',
                );

                yield historyQueries.updateOne(
                    { id },
                    {
                        last_results: JSON.stringify(
                            getResultsIdentifiers(fullResult),
                        ),
                        nb_results:
                            fullResult.SearchResult.Statistics.TotalHits,
                    },
                );

                const newRawRecords = getMissingResults(
                    fullResult,
                    last_results,
                );
                if (!newRawRecords.length) {
                    alertLogger.info('No new results');
                    return;
                }

                alertLogger.info(`${newRawRecords.length} new results found`);
                const newRecords = yield newRawRecords.map(articleParser);

                const rawNotices = yield newRecords.map(({ an, dbId }) =>
                    retrieveArticle(dbId, an),
                );
                const notices = yield rawNotices.map(rawNotice =>
                    retrieveArticleParser(rawNotice),
                );

                const records = newRecords.map((record, index) => ({
                    ...record,
                    articleLinks: notices[index].articleLinks,
                }));

                const { mail } = yield janusAccountQueries.selectOne({
                    id: user_id,
                });

                const mailData = getSearchAlertMail(
                    records,
                    community.gate,
                    queries,
                    community.name,
                    limiters,
                    activeFacets,
                    mail,
                );
                yield sendMail(mailData);
            });
        } catch (error) {
            alertLogger.error(error);
        }
        alertLogger.info(`batch done`);
    }
    yield db.query({
        sql: `UPDATE history SET last_execution = $date WHERE last_execution + frequence <= $date::date AND has_alert IS true`,
        parameters: {
            date: new Date(),
        },
    });
}

co(main)
    .then(() => {
        alertLogger.info('done');
        process.exit(0);
    })
    .catch(error => {
        alertLogger.error(error);
        process.exit(1);
    });
