import { crudQueries, batchUpsertQuery } from 'co-postgres-queries';

const userInstituteQueries = crudQueries(
    'janus_account_institute',
    ['institute_id', 'janus_account_id', 'index'],
    ['institute_id', 'janus_account_id'],
    ['*'],
    [],
);
const batchUpsert = batchUpsertQuery(
    'janus_account_institute',
    ['institute_id', 'janus_account_id'],
    ['institute_id', 'janus_account_id', 'index'],
    ['institute_id', 'janus_account_id', 'index'],
);

export default {
    ...userInstituteQueries,
    batchUpsert,
};
