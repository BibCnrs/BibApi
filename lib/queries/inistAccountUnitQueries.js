import { crudQueries, batchUpsertQuery } from 'co-postgres-queries';

const inistAccountUnitQueries = crudQueries(
    'inist_account_unit',
    ['inist_account_id', 'unit_id', 'index'],
    ['inist_account_id', 'unit_id'],
    ['*'],
    [],
);
const batchUpsert = batchUpsertQuery(
    'inist_account_unit',
    ['inist_account_id', 'unit_id'],
    ['inist_account_id', 'unit_id', 'index'],
    ['inist_account_id', 'unit_id', 'index'],
);

export default {
    ...inistAccountUnitQueries,
    batchUpsert,
};
