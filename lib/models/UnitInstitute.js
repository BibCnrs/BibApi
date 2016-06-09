import { crud, batchUpsert } from 'co-postgres-queries';

const unitInstituteQueries = crud('unit_institute', ['institute_id', 'unit_id'], ['institute_id', 'unit_id', 'index'], ['*'], []);
const batchUpsertQuery = batchUpsert('unit_institute', ['unit_id', 'institute_id'], ['unit_id', 'institute_id', 'index'], ['unit_id', 'institute_id', 'index']);

export default (client) => {
    const queries = unitInstituteQueries(client);

    queries.batchUpsert = batchUpsertQuery(client);

    queries.assignInstituteToUnit = function* (instituteIds, unitId) {
        return yield queries.batchInsert(instituteIds.map((instituteId, index) => ({ institute_id: instituteId, unit_id: unitId, index })));
    };

    queries.unassignInstituteFromUnit = function* (instituteIds, unitId) {
        return yield queries.batchDelete(instituteIds.map((instituteId, index) => ({ institute_id: instituteId, unit_id: unitId, index })));
    };

    return queries;
};
