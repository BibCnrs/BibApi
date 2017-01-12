import sectionCNSecondaryInstituteQueries from '../queries/sectionCNSecondaryInstituteQueries';

function SectionCNSecondaryInstitute(client) {
    const sectionCNSecondaryInstituteClient = client.link(SectionCNSecondaryInstitute.queries);

    const assignSecondaryInstituteToSectionCN = function* (units, sectionCNId) {
        return yield sectionCNSecondaryInstituteClient.batchUpsert(units.map((instituteId) => ({ institute_id: instituteId, section_cn_id: sectionCNId })));
    };

    const unassignSecondaryInstituteFromSectionCN = function* (instituteIds, sectionCNId) {
        return yield sectionCNSecondaryInstituteClient.batchDelete(instituteIds.map((instituteId) => ({ institute_id: instituteId, section_cn_id: sectionCNId })));
    };

    return {
        ...sectionCNSecondaryInstituteClient,
        assignSecondaryInstituteToSectionCN,
        unassignSecondaryInstituteFromSectionCN
    };
}

SectionCNSecondaryInstitute.queries = sectionCNSecondaryInstituteQueries;

export default SectionCNSecondaryInstitute;
