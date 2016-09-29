import { crudQueries, batchUpsertQuery } from 'co-postgres-queries';

const unitCommunityQueries = crudQueries(
    'unit_community',
    ['unit_id', 'community_id', 'index'],
    ['unit_id', 'community_id'],
    ['*'],
    []
);
const batchUpsert = batchUpsertQuery(
    'unit_community',
    ['unit_id', 'community_id'],
    ['unit_id', 'community_id', 'index'],
    ['unit_id', 'community_id', 'index']
);

export default {
    ...unitCommunityQueries,
    batchUpsert
};
