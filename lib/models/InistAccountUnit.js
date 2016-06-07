import { crud } from 'co-postgres-queries';

const inistAccountInstituteQueries = crud('inist_account_unit', ['inist_account_id', 'unit_id'], ['inist_account_id', 'unit_id'], ['*'], []);

export default (client) => {

    const queries = inistAccountInstituteQueries(client);

    queries.assignUnitToInistAccount = function* (unitIds, inistAccountId) {
        return yield queries.batchInsert(unitIds.map(unitId => ({ unit_id: unitId, inist_account_id: inistAccountId })));
    };

    queries.unassignUnitFromInistAccount = function* (unitIds, inistAccountId) {
        return yield queries.batchDelete(unitIds.map(unitId => ({ unit_id: unitId, inist_account_id: inistAccountId })));
    };
    return queries;
};
