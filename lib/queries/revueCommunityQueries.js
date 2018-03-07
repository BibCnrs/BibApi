import { crudQueries, batchUpsertQuery } from 'co-postgres-queries';

const crud = crudQueries(
    'revue_community',
    ['revue_id', 'community_id'],
    ['revue_id', 'community_id'],
    ['revue_id', 'community_id'],
    [],
);

const batchUpsert = batchUpsertQuery(
    'revue_community',
    ['revue_id', 'community_id'],
    ['revue_id', 'community_id'],
);

export default {
    ...crud,
    batchUpsert,
};
