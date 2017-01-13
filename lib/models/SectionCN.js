import sectionCNQueries from '../queries/sectionCNQueries';
import Institute from './Institute';
import SectionCNPrimaryInstitute from './SectionCNPrimaryInstitute';
import SectionCNSecondaryInstitute from './SectionCNSecondaryInstitute';
import entityAssigner from './entityAssigner';
import checkEntityExists from './checkEntityExists';

function SectionCN(client) {
    const sectionCNClient = client.link(SectionCN.queries);
    const instituteClient = Institute(client);
    const sectionCNPrimaryInstituteClient = SectionCNPrimaryInstitute(client);
    const SectionCNSecondaryInstituteClient = SectionCNSecondaryInstitute(client);

    const updatePrimaryInstitutes = entityAssigner(
        instituteClient.selectByIds,
        instituteClient.selectPrimaryBySectionCNId,
        sectionCNPrimaryInstituteClient.unassignPrimaryInstituteFromSectionCN,
        sectionCNPrimaryInstituteClient.assignPrimaryInstituteToSectionCN
    );

    const updateSecondaryInstitutes = entityAssigner(
        instituteClient.selectByIds,
        instituteClient.selectSecondaryBySectionCNId,
        SectionCNSecondaryInstituteClient.unassignSecondaryInstituteFromSectionCN,
        SectionCNSecondaryInstituteClient.assignSecondaryInstituteToSectionCN
    );

    const insertOne = function* insertOne(sectionCN) {
        try {
            yield client.begin();
            const insertedSectionCN = yield sectionCNClient.insertOne(sectionCN);

            const primaryInstitutes = yield updatePrimaryInstitutes(sectionCN.primary_institutes, insertedSectionCN.id);
            const secondaryInstitutes = yield updateSecondaryInstitutes(sectionCN.secondary_institutes, insertedSectionCN.id);

            yield client.commit();

            return {
                ...insertedSectionCN,
                primary_institutes: primaryInstitutes,
                secondary_institutes: secondaryInstitutes,
            };
        } catch (error) {
            yield client.rollback();
            throw error;
        }
    };

    const updateOne = function* (selector, sectionCN) {
        try {
            yield client.begin();

            let updatedSectionCN;
            try {
                updatedSectionCN = yield sectionCNClient.updateOne(selector, sectionCN);
            } catch (error) {
                if(error.message !== 'no valid column to set') {
                    throw error;
                }
                updatedSectionCN = yield sectionCNClient.selectOne({ id: selector });
            }
            const primaryInstitutes = yield updatePrimaryInstitutes(sectionCN.primary_institutes, updatedSectionCN.id);
            const secondaryInstitutes = yield updateSecondaryInstitutes(sectionCN.secondary_institutes, updatedSectionCN.id);

            yield client.commit();

            return {
                ...updatedSectionCN,
                primary_institutes: primaryInstitutes,
                secondary_institutes: secondaryInstitutes,
            };
        } catch (error) {
            yield client.rollback();
            throw error;
        }
    };

    const selectByIds = function* (ids) {
        const sectionsCN = yield sectionCNClient.selectByIds(ids);
        checkEntityExists('SectionsCN', 'id', ids, sectionsCN);

        return sectionsCN;
    };

    const selectByCodes = function* (codes) {
        const sections = yield sectionCNClient.selectBy(null, null, { code: codes });
        checkEntityExists('Sections', 'code', codes, sections);

        return sections;
    };

    const selectByUnitId = function* (unitId) {
        return yield sectionCNClient.selectByUnitId(null, null, { unit_id: unitId }, 'index', 'ASC');
    };

    return {
        ...sectionCNClient,
        updatePrimaryInstitutes,
        updateSecondaryInstitutes,
        insertOne,
        updateOne,
        selectByIds,
        selectByUnitId,
        selectByCodes,
    };
}

SectionCN.queries = sectionCNQueries;

export default SectionCN;
