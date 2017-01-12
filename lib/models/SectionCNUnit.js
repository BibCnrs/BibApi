import sectionCNUnitQueries from '../queries/sectionCNUnitQueries';

function SectionCNUnit(client) {
    const sectionCNUnitClient = client.link(SectionCNUnit.queries);

    const assignUnitToSectionCN = function* (units, sectionCNId) {
        return yield sectionCNUnitClient.batchUpsert(units.map((unitId) => ({ unit_id: unitId, section_cn_id: sectionCNId })));
    };

    const unassignUnitFromSectionCN = function* (unitIds, sectionCNId) {
        return yield sectionCNUnitClient.batchDelete(unitIds.map((unitId) => ({ unit_id: unitId, section_cn_id: sectionCNId })));
    };

    return {
        ...sectionCNUnitClient,
        assignUnitToSectionCN,
        unassignUnitFromSectionCN
    };
}

SectionCNUnit.queries = sectionCNUnitQueries;

export default SectionCNUnit;
