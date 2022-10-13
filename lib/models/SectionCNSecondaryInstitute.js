import prisma from '../../prisma/prisma';

export const assignSecondaryInstituteToSectionCN = function* (
    units,
    sectionCNId,
) {
    return yield prisma.$transaction(
        units.map((instituteId, index) =>
            prisma.section_cn_secondary_institute.upsert({
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

export const unassignSecondaryInstituteFromSectionCN = function* (
    instituteIds,
    sectionCNId,
) {
    return yield prisma.$transaction(
        instituteIds.map((instituteId, index) =>
            prisma.section_cn_secondary_institute.delete({
                where: {
                    institute_id: instituteId,
                    section_cn_id: sectionCNId,
                    index,
                },
            }),
        ),
    );
};
