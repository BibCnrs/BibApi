import { crudQueries, batchUpsertQuery } from 'co-postgres-queries';

const inistAccountInstituteQueries = crudQueries(
    'inist_account_institute',
    ['inist_account_id', 'institute_id', 'index'],
    ['inist_account_id', 'institute_id'],
    ['*'],
    [],
);

const batchUpsert = batchUpsertQuery(
    'inist_account_institute',
    ['inist_account_id', 'institute_id'],
    ['inist_account_id', 'institute_id', 'index'],
    ['inist_account_id', 'institute_id', 'index'],
);

export default {
    ...inistAccountInstituteQueries,
    batchUpsert,
};
