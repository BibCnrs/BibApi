import {
    selectPrimaryBySectionCNId,
    selectByIds as selectInstituteByIds,
    selectSecondaryBySectionCNId,
} from './Institute';
import {
    assignPrimaryInstituteToSectionCN,
    unassignPrimaryInstituteFromSectionCN,
} from './SectionCNPrimaryInstitute';
import {
    assignSecondaryInstituteToSectionCN,
    unassignSecondaryInstituteFromSectionCN,
} from './SectionCNSecondaryInstitute';
import entityAssigner from './entityAssigner';
import checkEntityExists from './checkEntityExists';
import prisma from '../../prisma/prisma';

export const updatePrimaryInstitutes = entityAssigner(
    selectInstituteByIds,
    selectPrimaryBySectionCNId,
    unassignPrimaryInstituteFromSectionCN,
    assignPrimaryInstituteToSectionCN,
);

export const updateSecondaryInstitutes = entityAssigner(
    selectInstituteByIds,
    selectSecondaryBySectionCNId,
    unassignSecondaryInstituteFromSectionCN,
    assignSecondaryInstituteToSectionCN,
);

export const insertOne = function* (sectionCN) {
    const insertedSectionCN = yield prisma.section_cn.create({
        data: sectionCN,
    });

    if (sectionCN.primary_institutes) {
        yield prisma.$queryRaw`INSERT INTO section_cn_primary_institute (section_cn_id, institute_id) VALUES (${insertedSectionCN.id}, ${sectionCN.primary_institutes})`;
    }

    let secondaryInstitutes = [];
    if (sectionCN.secondary_institutes) {
        secondaryInstitutes = yield updateSecondaryInstitutes(
            sectionCN.secondary_institutes,
            insertedSectionCN.id,
        );
    }

    return {
        ...insertedSectionCN,
        primary_institutes: sectionCN.primary_institutes,
        secondary_institutes: secondaryInstitutes,
    };
};

export const updateOne = function* (sectionCNId, sectionCN) {
    const updatedSectionCN = yield prisma.section_cn.update({
        where: {
            id: sectionCNId,
        },
    });

    if (sectionCN.primary_institutes) {
        yield prisma.$queryRaw`UPDATE section_cn_primary_institute SET institute_id = ${sectionCN.primary_institutes} WHERE section_cn_id = ${sectionCN.id}`;
    }
    let secondaryInstitutes = [];
    if (sectionCN.secondary_institutes) {
        secondaryInstitutes = yield updateSecondaryInstitutes(
            sectionCN.secondary_institutes,
            updatedSectionCN.id,
        );
    }

    return {
        ...updatedSectionCN,
        primary_institutes: sectionCN.primary_institutes,
        secondary_institutes: secondaryInstitutes,
    };
};

export const selectByIds = function* (ids) {
    const sectionsCN = yield prisma.section_cn.findMany({
        where: {
            id: {
                in: ids,
            },
        },
    });
    checkEntityExists('SectionsCN', 'id', ids, sectionsCN);

    return sectionsCN;
};

export const selectByCodes = function* (codes) {
    const sections = yield prisma.section_cn.findMany({
        where: {
            code: {
                in: codes,
            },
        },
    });
    checkEntityExists('Sections', 'code', codes, sections);

    return sections;
};

export const selectByUnitId = function* (unitId) {
    return yield prisma.section_cn.findMany({
        where: {
            unit_section_cn: {
                some: {
                    unit_id: unitId,
                },
            },
        },
        orderBy: {
            index: 'asc',
        },
    });
};
