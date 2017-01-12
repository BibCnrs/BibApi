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

const deleteEntriesCreatedBeforeThan = (oldestDate) => ({
    sql: 'WITH deleted AS (DELETE FROM history WHERE created_at < $oldestDate::timestamp RETURNING *) SELECT count(*) FROM deleted;',
    parameters: { oldestDate },
});

crud.selectPage
.table('history')
.groupByFields(['id'])
.returnFields(returnFields)
.searchableFields([
    'user_id',
]);

export default {
    ...crud,
    deleteEntriesCreatedBeforeThan,
};
