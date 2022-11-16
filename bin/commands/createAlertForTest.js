import co from 'co';
import minimist from 'minimist';

import { getHistories } from '../../lib/models/History';
import { getCommunities } from '../../lib/models/Community';
import searchArticle from '../../lib/services/searchArticle';
import getRedisClient from '../../lib/utils/getRedisClient';
import ebscoSession from '../../lib/services/ebscoSession';
import ebscoAuthentication from '../../lib/services/ebscoAuthentication';
import ebscoTokenFactory from '../../lib/services/ebscoToken';
import { getResultsIdentifiers } from '../../lib/services/getMissingResults';
import { getQueryFromHistory } from '../../lib/controller/ebsco/searchAlert';
import { selectOneByUid } from '../../lib/models/JanusAccount';
import prisma from '../../lib/prisma/prisma';

const arg = minimist(process.argv.slice(2));
const uid = arg._[0];

function* main() {
    global.console.log('Starting');
    const redis = getRedisClient();
    const allCommunities = yield getCommunities();
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

    const user = yield selectOneByUid(uid);

    const histories = yield getHistories({
        filters: { user_id: user.id.toString() },
    });

    yield histories.map(function* (history) {
        const query = getQueryFromHistory(history);
        const domain = communityByName[history.event.domain];
        const searchResult = yield searchArticle(domain, ebscoToken)(query);
        yield prisma.$queryRaw`
            UPDATE history SET 
            has_alert = true, 
            frequence = '1 day',
            last_results = CAST(${JSON.stringify(
                getResultsIdentifiers(searchResult).slice(3),
            )} AS json),
            last_execution = ${new Date(0)},
            nb_results = ${
                searchResult.SearchResult.Statistics.TotalHits - 3 > 0
                    ? searchResult.SearchResult.Statistics.TotalHits - 3
                    : 0
            },
            active = true
            WHERE id = ${parseInt(history.id)}`;
    });
}

co(main)
    .then(() => {
        global.console.log('done');
        process.exit(0);
    })
    .catch((error) => {
        global.console.log(error);
        process.exit(1);
    });
