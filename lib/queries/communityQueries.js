import { crudQueries, selectOneQuery, selectPageQuery, selectByOrderedFieldValuesQuery } from 'co-postgres-queries';

const crud = crudQueries('community', ['name', 'gate', 'user_id', 'password', 'profile', 'ebsco'], ['id'], ['id', 'name', 'gate', 'user_id', 'password', 'profile', 'ebsco'], []);
const selectOneByName = selectOneQuery('community', ['name'], ['*']);
const selectOneByGate = selectOneQuery('community', ['gate'], ['*']);
const selectByNames = selectByOrderedFieldValuesQuery('community', 'name', ['id', 'name', 'gate', 'user_id', 'password', 'profile', 'ebsco']);
const selectByIds = selectByOrderedFieldValuesQuery('community', 'id', ['id', 'name', 'gate', 'user_id', 'password', 'profile', 'ebsco']);

const selectByJanusAccountId = selectPageQuery(
    'community JOIN janus_account_community ON (community.id = janus_account_community.community_id)',
    ['janus_account_id'],
    ['id', 'janus_account_id', 'name', 'gate', 'user_id', 'password', 'profile', 'index', 'ebsco']
);
const selectByInistAccountId = selectPageQuery(
    'community JOIN inist_account_community ON (community.id = inist_account_community.community_id)',
    ['inist_account_id'],
    ['id', 'inist_account_id', 'name', 'gate', 'user_id', 'password', 'profile', 'index', 'ebsco']
);
const selectByInstituteId = selectPageQuery(
    'community JOIN institute_community ON (community.id = institute_community.community_id)',
    ['institute_id'],
    ['id', 'institute_id', 'name', 'gate', 'user_id', 'password', 'profile', 'index', 'ebsco']
);
const selectByUnitId = selectPageQuery(
    'community JOIN unit_community ON (community.id = unit_community.community_id)',
    ['unit_id'],
    ['id', 'unit_id', 'name', 'gate', 'user_id', 'password', 'profile', 'index', 'ebsco']
);

export default {
    ...crud,
    selectOneByName,
    selectOneByGate,
    selectByNames,
    selectByIds,
    selectByJanusAccountId,
    selectByInistAccountId,
    selectByInstituteId,
    selectByUnitId
};
