import { crud } from 'co-postgres-queries';

const userUnitQueries = crud('janus_account_unit', ['unit_id', 'janus_account_id'], ['unit_id', 'janus_account_id'], ['*'], []);

export default (client) => {
    const queries = userUnitQueries(client);

    queries.assignUnitToUser = function* (unitIds, userId) {
        return yield queries.batchInsert(unitIds.map(unitId => ({ unit_id: unitId, janus_account_id: userId })));
    };

    queries.unassignUnitFromUser = function* (unitIds, userId) {
        return yield queries.batchDelete(unitIds.map(unitId => ({ unit_id: unitId, janus_account_id: userId })));
    };

    return queries;
};
