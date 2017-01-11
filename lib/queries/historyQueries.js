import { crudQueries } from 'co-postgres-queries';

const returnFields = [
    'id',
    'user_id',
    'event',
];

const crud = crudQueries(
    'history',
    ['user_id', 'event'],
    ['id'],
    returnFields,
    []
);

crud.selectPage
.table('history')
.groupByFields(['id'])
.returnFields(returnFields)
.searchableFields([
    'user_id',
]);

export default crud;
