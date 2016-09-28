import { crudQueries, selectOneQuery, selectPageQuery, selectByOrderedFieldValuesQuery } from 'co-postgres-queries';

import checkEntityExists from './checkEntityExists';

const community = crudQueries('community', ['name', 'gate', 'user_id', 'password', 'profile', 'ebsco'], ['id'], ['id', 'name', 'gate', 'user_id', 'password', 'profile', 'ebsco'], []);
const selectOneByNameQuery = selectOneQuery('community', ['name'], ['*']);
const selectOneByGateQuery = selectOneQuery('community', ['gate'], ['*']);
const selectByNamesQuery = selectByOrderedFieldValuesQuery('community', 'name', ['id', 'name', 'gate', 'user_id', 'password', 'profile', 'ebsco']);
const selectByIdsQuery = selectByOrderedFieldValuesQuery('community', 'id', ['id', 'name', 'gate', 'user_id', 'password', 'profile', 'ebsco']);

const selectByJanusAccountIdQuery = selectPageQuery(
    'community JOIN janus_account_community ON (community.id = janus_account_community.community_id)',
    ['janus_account_id'],
    ['id', 'janus_account_id', 'name', 'gate', 'user_id', 'password', 'profile', 'index', 'ebsco']
);
const selectByInistAccountIdQuery = selectPageQuery(
    'community JOIN inist_account_community ON (community.id = inist_account_community.community_id)',
    ['inist_account_id'],
    ['id', 'inist_account_id', 'name', 'gate', 'user_id', 'password', 'profile', 'index', 'ebsco']
);
const selectByInstituteIdQuery = selectPageQuery(
    'community JOIN institute_community ON (community.id = institute_community.community_id)',
    ['institute_id'],
    ['id', 'institute_id', 'name', 'gate', 'user_id', 'password', 'profile', 'index', 'ebsco']
);
const selectByUnitIdQuery = selectPageQuery(
    'community JOIN unit_community ON (community.id = unit_community.community_id)',
    ['unit_id'],
    ['id', 'unit_id', 'name', 'gate', 'user_id', 'password', 'profile', 'index', 'ebsco']
);

export default (client) => {
    const queries = client.link(community);
    const selectOneByName = client.link(selectOneByNameQuery);
    const selectByJanusAccountId = client.link(selectByJanusAccountIdQuery);
    const selectByInistAccountId = client.link(selectByInistAccountIdQuery);
    const selectByInstituteId = client.link(selectByInstituteIdQuery);
    const selectByUnitId = client.link(selectByUnitIdQuery);
    const selectByNames = client.link(selectByNamesQuery);
    const selectByIds = client.link(selectByIdsQuery);

    queries.selectOneByName = function* (name) {
        const community =  yield selectOneByName({ name });
        if(!community) {
            const error = new Error(`Community ${name} does not exists`);
            error.status = 500;
            throw error;
        }

        return community;
    };

    queries.selectOneByGate = client.link(selectOneByGateQuery);

    queries.selectByNames = function* (names) {
        const communities = yield selectByNames(names);
        checkEntityExists('Communities', 'name', names, communities);

        return communities;
    };

    queries.selectByIds = function* (ids) {
        const communities = yield selectByIds(ids);
        checkEntityExists('Communities', 'id', ids, communities);

        return communities;
    };

    queries.selectByJanusAccountId = function* (userId) {
        return yield selectByJanusAccountId(null, null, { janus_account_id: userId }, 'index', 'ASC');
    };

    queries.selectByInistAccountId = function* (inistAccountId) {
        return yield selectByInistAccountId(null, null, { inist_account_id: inistAccountId }, 'index', 'ASC');
    };

    queries.selectByInstituteId = function* (instituteId) {
        return yield selectByInstituteId(null, null, { institute_id: instituteId }, 'index', 'ASC');
    };

    queries.selectByUnitId = function* (unitId) {
        return yield selectByUnitId(null, null, { unit_id: unitId }, 'index', 'ASC');
    };

    return queries;
};
