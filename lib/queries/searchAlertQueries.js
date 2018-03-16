import { crudQueries } from 'co-postgres-queries';

const fields = [
    'id',
    'history_id',
    'user_id',
    'frequence',
    'last_execution',
    'last_results',
    'nb_results',
];

const searchAlertQueries = crudQueries(
    `search_alert
    JOIN history ON history.id = search_alert.history_id
    JOIN janus_account ON janus_account.id = search_alert.user_id`,
    fields,
    ['id'],
    fields,
);

const selectFields = [
    fields.map(field => `search_alert.${field} as ${field}`),
    'janus_account.mail as mail',
    'history.event as search',
];

const selectTable = `search_alert
JOIN history ON history.id = search_alert.history_id
JOIN janus_account ON janus_account.id = search_alert.user_id`;

searchAlertQueries.selectOne.table(selectTable);
searchAlertQueries.selectOne.returnFields(selectFields);

searchAlertQueries.selectPage.table(selectTable);
searchAlertQueries.selectPage.returnFields(selectFields);

export default searchAlertQueries;
