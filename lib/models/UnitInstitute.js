import { crud } from 'co-postgres-queries';

const unitInstituteQueries = crud('unit_institute', ['institute_id', 'unit_id'], ['institute_id', 'unit_id'], ['*'], []);

export default (client) => {
    const queries = unitInstituteQueries(client);

    queries.assignInstituteToUnit = function* (instituteIds, unitId) {
        return yield queries.batchInsert(instituteIds.map(instituteId => ({ institute_id: instituteId, unit_id: unitId })));
    };

    queries.unassignInstituteFromUnit = function* (instituteIds, unitId) {
        return yield queries.batchDelete(instituteIds.map(instituteId => ({ institute_id: instituteId, unit_id: unitId })));
    };

    return queries;
};
