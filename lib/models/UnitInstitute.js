import unitInstituteQueries from '../queries/unitInstituteQueries';

function UnitInstitute(client) {
    const unitInstituteClient = client.link(UnitInstitute.queries);

    const assignInstituteToUnit = function* (instituteIds, unitId) {
        return yield unitInstituteClient.batchUpsert(instituteIds.map((instituteId, index) => ({ institute_id: instituteId, unit_id: unitId, index })));
    };

    const unassignInstituteFromUnit = function* (instituteIds, unitId) {
        return yield unitInstituteClient.batchDelete(instituteIds.map((instituteId, index) => ({ institute_id: instituteId, unit_id: unitId, index })));
    };

    return {
        ...unitInstituteClient,
        assignInstituteToUnit,
        unassignInstituteFromUnit
    };
}

UnitInstitute.queries = unitInstituteQueries;

export default UnitInstitute;
