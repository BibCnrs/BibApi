import { crudQueries } from 'co-postgres-queries';

const returnFields = ['id', 'user_id', 'created_at', 'event', 'has_alert'];

const crud = crudQueries(
    'history',
    ['user_id', 'event', 'created_at', 'has_alert'],
    ['id'],
    returnFields,
    [],
);

const deleteEntriesCreatedBeforeThan = oldestDate => ({
    sql:
        'WITH deleted AS (DELETE FROM history WHERE has_alert is false AND created_at < $oldestDate::timestamp RETURNING *) SELECT count(*) FROM deleted;',
    parameters: { oldestDate },
});

crud.selectPage
    .table('history')
    .groupByFields(['id'])
    .returnFields(returnFields)
    .searchableFields(['user_id']);

export default {
    ...crud,
    deleteEntriesCreatedBeforeThan,
};
