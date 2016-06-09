import { crud, batchUpsert } from 'co-postgres-queries';

const inistAccountInstituteQueries = crud('inist_account_unit', ['inist_account_id', 'unit_id'], ['inist_account_id', 'unit_id', 'index'], ['*'], []);
const batchUpsertQuery = batchUpsert('inist_account_unit', ['inist_account_id', 'unit_id'], ['inist_account_id', 'unit_id', 'index'], ['inist_account_id', 'unit_id', 'index']);

export default (client) => {

    const queries = inistAccountInstituteQueries(client);

    queries.batchUpsert = batchUpsertQuery(client);

    queries.assignUnitToInistAccount = function* (unitIds, inistAccountId) {
        return yield queries.batchInsert(unitIds.map((unitId, index) => ({ unit_id: unitId, inist_account_id: inistAccountId, index })));
    };

    queries.unassignUnitFromInistAccount = function* (unitIds, inistAccountId) {
        return yield queries.batchDelete(unitIds.map((unitId, index) => ({ unit_id: unitId, inist_account_id: inistAccountId, index })));
    };
    return queries;
};
