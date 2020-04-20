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

const selectAlertToExecute = ({ date, limit, offset }) => ({
    sql: `SELECT * FROM history WHERE last_execution + frequence <= $date::date AND has_alert IS true ORDER BY id ASC LIMIT $limit OFFSET $offset`,
    parameters: {
        date,
        limit,
        offset,
    },
});

const countAlertToExecute = ({ date }) => ({
    sql: `SELECT count(*) FROM history WHERE last_execution + frequence <= $date::date AND has_alert IS true`,
    parameters: {
        date,
    },
});

const deleteAllHistoriesNotAlertForUser = ({ user_id }) => ({
    sql: 'DELETE FROM history WHERE user_id = $user_id AND has_alert = false',
    parameters: {
        user_id,
    },
});

export default {
    ...crud,
    deleteEntriesCreatedBeforeThan,
    deleteAllHistoriesNotAlertForUser,
    selectAlertToExecute,
    countAlertToExecute,
};
