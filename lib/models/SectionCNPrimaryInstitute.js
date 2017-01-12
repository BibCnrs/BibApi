import sectionCNPrimaryInstituteQueries from '../queries/sectionCNPrimaryInstituteQueries';

function SectionCNPrimaryInstitute(client) {
    const sectionCNPrimaryInstituteClient = client.link(SectionCNPrimaryInstitute.queries);

    const assignPrimaryInstituteToSectionCN = function* (units, sectionCNId) {
        return yield sectionCNPrimaryInstituteClient.batchUpsert(units.map((instituteId) => ({ institute_id: instituteId, section_cn_id: sectionCNId })));
    };

    const unassignPrimaryInstituteFromSectionCN = function* (instituteIds, sectionCNId) {
        return yield sectionCNPrimaryInstituteClient.batchDelete(instituteIds.map((instituteId) => ({ institute_id: instituteId, section_cn_id: sectionCNId })));
    };

    return {
        ...sectionCNPrimaryInstituteClient,
        assignPrimaryInstituteToSectionCN,
        unassignPrimaryInstituteFromSectionCN
    };
}

SectionCNPrimaryInstitute.queries = sectionCNPrimaryInstituteQueries;

export default SectionCNPrimaryInstitute;
