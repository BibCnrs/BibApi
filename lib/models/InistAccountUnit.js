import { crudQueries, batchUpsertQuery } from 'co-postgres-queries';

const inistAccountInstituteQueries = crudQueries('inist_account_unit', ['inist_account_id', 'unit_id', 'index'], ['inist_account_id', 'unit_id'], ['*'], []);
const batchUpsertInistAccountInstituteQuery = batchUpsertQuery('inist_account_unit', ['inist_account_id', 'unit_id'], ['inist_account_id', 'unit_id', 'index'], ['inist_account_id', 'unit_id', 'index']);

export default (client) => {

    const queries = client.link(inistAccountInstituteQueries);

    queries.batchUpsert = client.link(batchUpsertInistAccountInstituteQuery);

    queries.assignUnitToInistAccount = function* (unitIds, inistAccountId) {
        return yield queries.batchUpsert(unitIds.map((unitId, index) => ({ unit_id: unitId, inist_account_id: inistAccountId, index })));
    };

    queries.unassignUnitFromInistAccount = function* (unitIds, inistAccountId) {
        return yield queries.batchDelete(unitIds.map((unitId) => ({ unit_id: unitId, inist_account_id: inistAccountId })));
    };
    return queries;
};
