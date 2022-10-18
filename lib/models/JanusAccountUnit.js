import prisma from '../prisma/prisma';

export const assignUnitToJanusAccount = function* (unitIds, userId) {
    return yield prisma.$transaction(
        unitIds.map((unitId, index) =>
            prisma.janus_account_unit.upsert({
                where: {
                    unit_id_janus_account_id: {
                        unit_id: unitId,
                        janus_account_id: userId,
                    },
                },
                update: {},
                create: {
                    unit_id: unitId,
                    janus_account_id: userId,
                    index,
                },
            }),
        ),
    );
};

export const unassignUnitFromJanusAccount = function* (unitIds, userId) {
    return yield prisma.$transaction(
        unitIds.map((unitId) =>
            prisma.janus_account_unit.delete({
                where: {
                    unit_id_janus_account_id: {
                        unit_id: unitId,
                        janus_account_id: userId,
                    },
                },
            }),
        ),
    );
};
