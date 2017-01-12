import sectionCNPrimaryInstituteQueries from '../queries/sectionCNPrimaryInstituteQueries';

function SectionCNPrimaryInstitute(client) {
    const sectionCNPrimaryInstituteClient = client.link(SectionCNPrimaryInstitute.queries);

    const assignPrimaryInstituteToSectionCN = function* (units, sectionCNId) {
        return yield sectionCNPrimaryInstituteClient.batchUpsert(units.map((instituteId, index) => ({ institute_id: instituteId, section_cn_id: sectionCNId, index })));
    };

    const unassignPrimaryInstituteFromSectionCN = function* (instituteIds, sectionCNId) {
        return yield sectionCNPrimaryInstituteClient.batchDelete(instituteIds.map((instituteId, index) => ({ institute_id: instituteId, section_cn_id: sectionCNId, index })));
    };

    return {
        ...sectionCNPrimaryInstituteClient,
        assignPrimaryInstituteToSectionCN,
        unassignPrimaryInstituteFromSectionCN
    };
}

SectionCNPrimaryInstitute.queries = sectionCNPrimaryInstituteQueries;

export default SectionCNPrimaryInstitute;
