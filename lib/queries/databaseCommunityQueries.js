import { crudQueries, batchUpsertQuery } from 'co-postgres-queries';

const crud = crudQueries(
    'database_community',
    ['database_id', 'community_id'],
    ['database_id', 'community_id'],
    ['database_id', 'community_id'],
    [],
);

const batchUpsert = batchUpsertQuery(
    'database_community',
    ['database_id', 'community_id'],
    ['database_id', 'community_id'],
);

export default {
    ...crud,
    batchUpsert,
};
