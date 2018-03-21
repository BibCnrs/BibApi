import { crudQueries } from 'co-postgres-queries';

const returnFields = [
    'id',
    'user_id',
    'created_at',
    'event',
    'has_alert',
    'frequence',
    'last_execution',
    'last_results',
    'nb_results',
];

const crud = crudQueries(
    'history',
    [
        'user_id',
        'event',
        'created_at',
        'has_alert',
        'frequence',
        'last_execution',
        'last_results',
        'nb_results',
    ],
    ['id'],
    returnFields,
    [],
);

const deleteEntriesCreatedBeforeThan = oldestDate => ({
    sql:
        'WITH deleted AS (DELETE FROM history WHERE has_alert is false AND created_at < $oldestDate::timestamp RETURNING *) SELECT count(*) FROM deleted;',
    parameters: { oldestDate },
});

export default {
    ...crud,
    deleteEntriesCreatedBeforeThan,
};
