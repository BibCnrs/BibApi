import checkEntityExists from './checkEntityExists';

import communityQueries from '../queries/communityQueries';

function Community(client) {
    const communityClient = client.link(Community.queries);

    const selectOneByName = function*(name) {
        const community = yield communityClient.selectOneByName({ name });
        if (!community) {
            const error = new Error(`Community ${name} does not exists`);
            error.status = 500;
            throw error;
        }

        return community;
    };

    const selectByNames = function*(names) {
        const communities = yield communityClient.selectByNames(names);
        checkEntityExists('Communities', 'name', names, communities);

        return communities;
    };

    const selectByIds = function*(ids) {
        const communities = yield communityClient.selectByIds(ids);
        checkEntityExists('Communities', 'id', ids, communities);

        return communities;
    };

    const selectByJanusAccountId = function*(userId) {
        return yield communityClient.selectByJanusAccountId(
            null,
            null,
            { janus_account_id: userId },
            'index',
            'ASC',
        );
    };

    const selectByInistAccountId = function*(inistAccountId) {
        return yield communityClient.selectByInistAccountId(
            null,
            null,
            { inist_account_id: inistAccountId },
            'index',
            'ASC',
        );
    };

    const selectByInstituteId = function*(instituteId) {
        return yield communityClient.selectByInstituteId(
            null,
            null,
            { institute_id: instituteId },
            'index',
            'ASC',
        );
    };

    const selectByUnitId = function*(unitId) {
        return yield communityClient.selectByUnitId(
            null,
            null,
            { unit_id: unitId },
            'index',
            'ASC',
        );
    };

    return {
        ...communityClient,
        selectOneByName,
        selectByNames,
        selectByIds,
        selectByJanusAccountId,
        selectByInistAccountId,
        selectByInstituteId,
        selectByUnitId,
    };
}

Community.queries = communityQueries;

export default Community;
