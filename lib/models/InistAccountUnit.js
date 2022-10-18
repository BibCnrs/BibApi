import prisma from '../prisma/prisma';

export const assignUnitToInistAccount = function* (unitIds, userId) {
    return yield prisma.$transaction(
        unitIds.map((unitId, index) =>
            prisma.inist_account_unit.upsert({
                where: {
                    unit_id_inist_account_id: {
                        unit_id: unitId,
                        inist_account_id: userId,
                    },
                },
                update: {},
                create: {
                    unit_id: unitId,
                    inist_account_id: userId,
                    index,
                },
            }),
        ),
    );
};

export const unassignUnitFromInistAccount = function* (unitIds, userId) {
    return yield prisma.$transaction(
        unitIds.map((unitId) =>
            prisma.inist_account_unit.delete({
                where: {
                    unit_id_inist_account_id: {
                        unit_id: unitId,
                        inist_account_id: userId,
                    },
                },
            }),
        ),
    );
};
