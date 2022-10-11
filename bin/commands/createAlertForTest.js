import co from 'co';
import { PgPool } from 'co-postgres-queries';
import config from 'config';
import minimist from 'minimist';

import JanusAccount from '../../lib/models/JanusAccount';
import History from '../../lib/models/History';
import Community from '../../lib/models/Community';
import searchArticle from '../../lib/services/searchArticle';
import getRedisClient from '../../lib/utils/getRedisClient';
import ebscoSession from '../../lib/services/ebscoSession';
import ebscoAuthentication from '../../lib/services/ebscoAuthentication';
import ebscoTokenFactory from '../../lib/services/ebscoToken';
import { getResultsIdentifiers } from '../../lib/services/getMissingResults';
import { getQueryFromHistory } from '../../lib/controller/ebsco/searchAlert';

const arg = minimist(process.argv.slice(2));
const uid = arg._[0];

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
    const janusAccountQueries = JanusAccount(db);
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

    const user = yield janusAccountQueries.selectOneByUid(uid);
    const histories = yield historyQueries.selectPage(null, null, {
        user_id: user.id,
    });

    yield histories.map(function* (history) {
        const query = getQueryFromHistory(history);
        const domain = communityByName[history.event.domain];
        const searchResult = yield searchArticle(domain, ebscoToken)(query);
        yield historyQueries.updateOne(
            { id: history.id },
            {
                has_alert: true,
                frequence: '1 day',
                last_results: JSON.stringify(
                    getResultsIdentifiers(searchResult).slice(3),
                ),
                last_execution: new Date(0),
                nb_results:
                    searchResult.SearchResult.Statistics.TotalHits - 3 > 0
                        ? searchResult.SearchResult.Statistics.TotalHits - 3
                        : 0,
                active: true,
            },
        );
    });
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
