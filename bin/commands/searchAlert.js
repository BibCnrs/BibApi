import { PgPool } from 'co-postgres-queries';
import config from 'config';
import co from 'co';
import get from 'lodash.get';

import History from '../../lib/models/History';
import Community from '../../lib/models/Community';
import searchArticleFactory from '../../lib/services/searchArticle';
import getRedisClient from '../../lib/utils/getRedisClient';
import articleParser from '../../lib/services/articleParser';
import retrieveArticleFactory from '../../lib/services/retrieveArticle';
import retrieveArticleParser from '../../lib/services/retrieveArticleParser';
import ebscoSession from '../../lib/services/ebscoSession';
import ebscoAuthentication from '../../lib/services/ebscoAuthentication';
import ebscoTokenFactory from '../../lib/services/ebscoToken';
import getMissingResults from '../../lib/services/getMissingResults';

function* main() {
    global.console.log('Starting');
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

    let [{ count }] = yield db.query({ sql: 'SELECT count(*) FROM history' });
    const pages = Math.max(count / 10);

    for (var i = 0; i <= pages; i++) {
        try {
            const histories = yield historyQueries.selectAlertToExecute({
                date: new Date(Date.now()),
                limit: 10,
                offset: 10 * i,
            });
            yield histories.map(function*({
                event: { queries, limiters, activeFacets, domain },
                nb_results,
                last_results,
            }) {
                const searchArticle = searchArticleFactory(
                    communityByName[domain],
                    ebscoToken,
                );

                const retrieveArticle = retrieveArticleFactory(
                    communityByName[domain],
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

                const newRawRecords = getMissingResults(
                    fullResult,
                    last_results,
                );
                const newRecords = yield newRawRecords.map(articleParser);

                const rawNotices = yield newRecords.map(({ an, dbId }) =>
                    retrieveArticle(dbId, an),
                );
                const notices = rawNotices.map(({ Record }) =>
                    retrieveArticleParser(Record),
                );
            });
        } catch (error) {
            global.console.log(error);
        }
        count -= 10;
    }
}

co(main)
    .then(() => {
        global.console.log('done');
        process.exit(0);
    })
    .catch(error => {
        global.console.log(error);
        process.exit(1);
    });
