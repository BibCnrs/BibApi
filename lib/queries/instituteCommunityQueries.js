import { crudQueries, batchUpsertQuery } from 'co-postgres-queries';

const instituteCommunityQueries = crudQueries(
    'institute_community',
    ['institute_id', 'community_id', 'index'],
    ['institute_id', 'community_id'],
    ['*'],
    [],
);
const batchUpsert = batchUpsertQuery(
    'institute_community',
    ['institute_id', 'community_id'],
    ['institute_id', 'community_id', 'index'],
    ['institute_id', 'community_id', 'index'],
);

export default {
    ...instituteCommunityQueries,
    batchUpsert,
};
