import { crudQueries, batchUpsertQuery } from 'co-postgres-queries';

const unitInstituteQueries = crudQueries('unit_institute', ['institute_id', 'unit_id', 'index'], ['institute_id', 'unit_id'], ['*'], []);
const batchUpsertUnitInstituteQuery = batchUpsertQuery('unit_institute', ['unit_id', 'institute_id'], ['unit_id', 'institute_id', 'index'], ['unit_id', 'institute_id', 'index']);

export default (client) => {
    const queries = client.link(unitInstituteQueries);

    queries.batchUpsert = client.link(batchUpsertUnitInstituteQuery);

    queries.assignInstituteToUnit = function* (instituteIds, unitId) {
        return yield queries.batchUpsert(instituteIds.map((instituteId, index) => ({ institute_id: instituteId, unit_id: unitId, index })));
    };

    queries.unassignInstituteFromUnit = function* (instituteIds, unitId) {
        return yield queries.batchDelete(instituteIds.map((instituteId, index) => ({ institute_id: instituteId, unit_id: unitId, index })));
    };

    return queries;
};
