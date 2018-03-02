import { crudQueries, batchUpsertQuery } from 'co-postgres-queries';

const unitInstituteQueries = crudQueries(
    'unit_institute',
    ['institute_id', 'unit_id', 'index'],
    ['institute_id', 'unit_id'],
    ['*'],
    [],
);

const batchUpsert = batchUpsertQuery(
    'unit_institute',
    ['unit_id', 'institute_id'],
    ['unit_id', 'institute_id', 'index'],
    ['unit_id', 'institute_id', 'index'],
);

export default {
    ...unitInstituteQueries,
    batchUpsert,
};
