import prisma from '../prisma/prisma';

export const assignSecondaryInstituteToSectionCN = function* (
    units,
    sectionCNId,
) {
    return yield prisma.$transaction(
        units.map((instituteId, index) =>
            prisma.section_cn_secondary_institute.upsert({
                where: {
                    section_cn_id_institute_id: {
                        institute_id: instituteId,
                        section_cn_id: sectionCNId,
                    },
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
        instituteIds.map((instituteId) =>
            prisma.section_cn_secondary_institute.delete({
                where: {
                    section_cn_id_institute_id: {
                        institute_id: instituteId,
                        section_cn_id: sectionCNId,
                    },
                },
            }),
        ),
    );
};
