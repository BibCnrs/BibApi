import prisma from '../prisma/prisma';

export const assignSectionCNToUnit = function* (sectionCNIds, unitId) {
    return yield prisma.$transaction(
        sectionCNIds.map((sectionCNId) =>
            prisma.unit_section_cn.upsert({
                where: {
                    section_cn_id_unit_id: {
                        unit_id: unitId,
                        section_cn_id: sectionCNId,
                    },
                },
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
                where: {
                    section_cn_id_unit_id: {
                        unit_id: unitId,
                        section_cn_id: sectionCNId,
                    },
                },
            }),
        ),
    );
};

export const batchUpsert = function* (batch) {
    return yield prisma.$transaction(
        batch.map(({ unit_id, section_cn_id, index }) =>
            prisma.unit_section_cn.upsert({
                where: {
                    section_cn_id_unit_id: {
                        unit_id,
                        section_cn_id,
                    },
                },
                update: { index },
                create: { unit_id, section_cn_id, index },
            }),
        ),
    );
};
