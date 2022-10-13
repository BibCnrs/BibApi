import prisma from '../../prisma/prisma';

export const assignPrimaryInstituteToSectionCN = function* (
    units,
    sectionCNId,
) {
    return yield prisma.$transaction(
        units.map((instituteId, index) =>
            prisma.section_cn_primary_institute.upsert({
                where: {
                    institute_id: instituteId,
                    section_cn_id: sectionCNId,
                    index,
                },
                update: {},
                create: {
                    institute_id: instituteId,
                    section_cn_id: sectionCNId,
                    index,
                },
            }),
        ),
    );
};

export const unassignPrimaryInstituteFromSectionCN = function* (
    instituteIds,
    sectionCNId,
) {
    return yield prisma.$transaction(
        instituteIds.map((instituteId, index) =>
            prisma.section_cn_primary_institute.delete({
                where: {
                    institute_id: instituteId,
                    section_cn_id: sectionCNId,
                    index,
                },
            }),
        ),
    );
};
