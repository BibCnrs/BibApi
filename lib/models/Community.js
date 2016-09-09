import { crud, selectOne, selectPage, selectByOrderedFieldValues } from 'co-postgres-queries';

import checkEntityExists from './checkEntityExists';

const communityQueries = crud('community', ['name', 'gate', 'user_id', 'password', 'profile', 'ebsco'], ['name'], ['id', 'name', 'gate', 'user_id', 'password', 'profile', 'ebsco'], []);
const selectOneByNameQuery = selectOne('community', ['name'], ['*']);
const selectOneByGateQuery = selectOne('community', ['gate'], ['*']);
const selectByNamesQuery = selectByOrderedFieldValues('community', 'name', ['id', 'name', 'gate', 'user_id', 'password', 'profile', 'ebsco']);

const selectByJanusAccountIdQuery = selectPage(
    'community JOIN janus_account_community ON (community.id = janus_account_community.community_id)',
    ['janus_account_id'],
    ['id', 'janus_account_id', 'name', 'gate', 'user_id', 'password', 'profile', 'index', 'ebsco']
);
const selectByInistAccountIdQuery = selectPage(
    'community JOIN inist_account_community ON (community.id = inist_account_community.community_id)',
    ['inist_account_id'],
    ['id', 'inist_account_id', 'name', 'gate', 'user_id', 'password', 'profile', 'index', 'ebsco']
);
const selectByInstituteIdQuery = selectPage(
    'community JOIN institute_community ON (community.id = institute_community.community_id)',
    ['institute_id'],
    ['id', 'institute_id', 'name', 'gate', 'user_id', 'password', 'profile', 'index', 'ebsco']
);
const selectByUnitIdQuery = selectPage(
    'community JOIN unit_community ON (community.id = unit_community.community_id)',
    ['unit_id'],
    ['id', 'unit_id', 'name', 'gate', 'user_id', 'password', 'profile', 'index', 'ebsco']
);

export default (client) => {
    const queries = communityQueries(client);
    const selectOneByName = selectOneByNameQuery(client);
    const selectByJanusAccountId = selectByJanusAccountIdQuery(client);
    const selectByInistAccountId = selectByInistAccountIdQuery(client);
    const selectByInstituteId = selectByInstituteIdQuery(client);
    const selectByUnitId = selectByUnitIdQuery(client);
    const selectByNames = selectByNamesQuery(client);


    queries.selectOneByName = function* (name) {
        const community =  yield selectOneByName({ name });
        if(!community) {
            const error = new Error(`Community ${name} does not exists`);
            error.status = 500;
            throw error;
        }

        return community;
    };

    queries.selectOneByGate = selectOneByGateQuery(client);

    queries.selectByNames = function* (names) {
        const communitys = yield selectByNames(names);
        checkEntityExists('Communities', 'name', names, communitys);

        return communitys;
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
