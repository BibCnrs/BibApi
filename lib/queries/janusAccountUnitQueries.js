import { crudQueries, batchUpsertQuery } from 'co-postgres-queries';

const janusAccountUnitQueries = crudQueries(
    'janus_account_unit',
    ['unit_id', 'janus_account_id', 'index'],
    ['unit_id', 'janus_account_id'],
    ['*'],
    [],
);
const batchUpsert = batchUpsertQuery(
    'janus_account_unit',
    ['unit_id', 'janus_account_id'],
    ['unit_id', 'janus_account_id', 'index'],
    ['*'],
    [],
);

export default {
    ...janusAccountUnitQueries,
    batchUpsert,
};
