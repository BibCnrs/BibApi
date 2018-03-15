import { PgPool } from 'co-postgres-queries';
import config from 'config';
import co from 'co';
import get from 'lodash.get';

import History from '../../lib/models/History';
import Community from '../../lib/models/Community';
import ebscoArticleSearch from '../../lib/services/ebscoArticleSearch';
import ebscoTokenFactory from '../../lib/services/ebscoToken';
import getRedisClient from '../../lib/utils/getRedisClient';
import ebscoSession from '../../lib/services/ebscoSession';
import ebscoAuthentication from '../../lib/services/ebscoAuthentication';
import articleParser from '../../lib/services/articleParser';
import ebscoEdsRetrieve from '../../lib/services/ebscoEdsRetrieve';
import retrieveArticleParser from '../../lib/services/retrieveArticleParser';

function* test() {
    global.console.log('Starting');
    const start = Date.now();
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
        const histories = yield historyQueries.selectPage(10);
        yield histories.map(function*({
            event: { queries, limiters, activeFacets, domain, totalHits },
        }) {
            const startQuery = Date.now();
            global.console.log('starting query');
            const { user_id, password, profile } = communityByName[domain];
            const { authToken, sessionToken } = yield ebscoToken.get(
                domain,
                user_id,
                password,
                profile,
            );
            const result = yield ebscoArticleSearch(
                {
                    queries,
                    limiters,
                    activeFacets,
                    resultsPerPage: 1,
                },
                sessionToken,
                authToken,
                'title',
            );
            const newTotalHits = get(
                result,
                'SearchResult.Statistics.TotalHits',
                0,
            );
            if (totalHits === newTotalHits) {
                global.console.log('search did not change');
                return;
            }
            global.console.log('search changed');

            const fullResult = yield ebscoArticleSearch(
                {
                    queries,
                    limiters,
                    activeFacets,
                    resultsPerPage: 100,
                },
                sessionToken,
                authToken,
                'brief',
            );

            const newRawRecords = get(
                fullResult,
                'SearchResult.Data.Records',
                [],
            ).slice(0, 10); // for test take the first 10 results and consider they are new
            const newRecords = yield newRawRecords.map(articleParser);

            const notices = yield newRecords.map(({ an, dbId }) =>
                ebscoEdsRetrieve(dbId, an, sessionToken, authToken),
            );
            notices.map(({ Record }) => retrieveArticleParser(Record));
            const endQuery = Date.now();
            global.console.log(`query done took ${endQuery - startQuery}`);
        });
        count -= 10;
    }

    const end = Date.now();
    global.console.log(`ended took : ${end - start}`);
}

co(test)
    .then(() => {
        global.console.log('done');
        process.exit(0);
    })
    .catch(error => {
        global.console.log(error);
        process.exit(1);
    });
