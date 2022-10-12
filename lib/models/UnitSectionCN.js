import unitSectionCNQueries from '../queries/unitSectionCNQueries';

function UnitSectionCN(client) {
    const unitSectionCNClient = client.link(UnitSectionCN.queries);

    const assignSectionCNToUnit = function* (sectionCNIds, unitId) {
        return yield unitSectionCNClient.batchUpsert(
            sectionCNIds.map((sectionCNId) => ({
                unit_id: unitId,
                section_cn_id: sectionCNId,
            })),
        );
    };

    const unassignSectionCNFromUnit = function* (sectionCNIds, unitId) {
        return yield unitSectionCNClient.batchDelete(
            sectionCNIds.map((sectionCNId) => ({
                unit_id: unitId,
                section_cn_id: sectionCNId,
            })),
        );
    };

    return {
        ...unitSectionCNClient,
        assignSectionCNToUnit,
        unassignSectionCNFromUnit,
    };
}

UnitSectionCN.queries = unitSectionCNQueries;

export default UnitSectionCN;
