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

export const getSectionCN = function* (options) {
    const { offset, take, order, filters } = options;
    const sections = yield prisma.section_cn.findMany({
        skip: offset,
        take: take,
        where: filters,
        orderBy: order,
        include: {
            section_cn_primary_institute: {
                select: {
                    institute_id: true,
                },
            },
            section_cn_secondary_institute: {
                select: {
                    institute_id: true,
                },
            },
        },
    });
    for (const section of sections) {
        section.primary_institutes = section.section_cn_primary_institute.map(
            (item) => item.institute_id,
        );

        section.seconday_institutes =
            section.section_cn_secondary_institute.map(
                (item) => item.institute_id,
            );
        delete section.section_cn_primary_institute;
        delete section.section_cn_secondary_institute;
    }
    return sections;
};

export const selectOne = function* (sectionCNId) {
    const section = yield prisma.section_cn.findUnique({
        where: {
            id: sectionCNId,
        },
        include: {
            section_cn_primary_institute: {
                select: {
                    institute_id: true,
                },
            },
            section_cn_secondary_institute: {
                select: {
                    institute_id: true,
                },
            },
        },
    });

    section.primary_institutes = section.section_cn_primary_institute.map(
        (item) => item.institute_id,
    );

    section.seconday_institutes = section.section_cn_secondary_institute.map(
        (item) => item.institute_id,
    );
    delete section.section_cn_primary_institute;
    delete section.section_cn_secondary_institute;

    return section;
};

export const batchInsert = function* (batch) {
    const insertedSections = yield prisma.section_cn.createMany({
        data: batch,
    });

    return insertedSections;
};
