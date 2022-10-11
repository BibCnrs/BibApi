import { crudQueries } from 'co-postgres-queries';

const returnFields = [
    'id',
    'user_id',
    'created_at',
    'event',
    'active',
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
        'active',
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
    sql: 'WITH deleted AS (DELETE FROM history WHERE has_alert is false AND created_at < $oldestDate::timestamp RETURNING *) SELECT count(*) FROM deleted;',
    parameters: { oldestDate },
});

const selectAlertToExecute = ({ date, limit }) => ({
    sql: `SELECT * FROM history WHERE last_execution + frequence <= $date::date AND has_alert IS true AND active IS true ORDER BY id ASC LIMIT $limit `,
    parameters: {
        date,
        limit,
    },
});

const countAlertToExecute = ({ date }) => ({
    sql: `SELECT count(*) FROM history WHERE last_execution + frequence <= $date::date AND has_alert IS true AND active IS true`,
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

const enableHistory = id => ({
    sql: 'UPDATE history SET active = true WHERE id = $id',
    parameters: {
        id,
    },
});

const disableHistory = id => ({
    sql: 'UPDATE history SET active = false WHERE id = $id',
    parameters: {
        id,
    },
});

const enableOrDisableAllAlert = (activeValue, user_id) => ({
    sql: 'UPDATE history SET active = $active WHERE has_alert = true AND user_id = $user_id',
    parameters: {
        active: activeValue,
        user_id,
    },
});

const countHistories = (user_id, has_alert) => ({
    sql: 'SELECT COUNT(id) FROM history WHERE has_alert = $has_alert AND user_id = $user_id',
    parameters: {
        has_alert,
        user_id,
    },
});

export default {
    ...crud,
    deleteEntriesCreatedBeforeThan,
    deleteAllHistoriesNotAlertForUser,
    selectAlertToExecute,
    countAlertToExecute,
    enableHistory,
    disableHistory,
    enableOrDisableAllAlert,
    countHistories,
};
