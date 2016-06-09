import { crud } from 'co-postgres-queries';

const userUnitQueries = crud('janus_account_unit', ['unit_id', 'janus_account_id'], ['unit_id', 'janus_account_id', 'index'], ['*'], []);

export default (client) => {
    const queries = userUnitQueries(client);

    queries.assignUnitToUser = function* (unitIds, userId) {
        return yield queries.batchInsert(unitIds.map((unitId, index) => ({ unit_id: unitId, janus_account_id: userId, index })));
    };

    queries.unassignUnitFromUser = function* (unitIds, userId) {
        return yield queries.batchDelete(unitIds.map((unitId, index) => ({ unit_id: unitId, janus_account_id: userId, index })));
    };

    return queries;
};
