import prisma from '../../prisma/prisma';

export const assignSectionCNToUnit = function* (sectionCNIds, unitId) {
    return yield prisma.$transaction(
        sectionCNIds.map((sectionCNId) =>
            prisma.unit_section_cn.upsert({
                where: { unit_id: unitId, section_cn_id: sectionCNId },
                update: {},
                create: { unit_id: unitId, section_cn_id: sectionCNId },
            }),
        ),
    );
};

export const unassignSectionCNFromUnit = function* (sectionCNIds, unitId) {
    return yield prisma.$transaction(
        sectionCNIds.map((sectionCNId) =>
            prisma.unit_section_cn.delete({
                where: { unit_id: unitId, section_cn_id: sectionCNId },
            }),
        ),
    );
};
