import prisma from '../../prisma/prisma';

export const assignInstituteToInistAccount = function* (instituteIds, userId) {
    return yield prisma.$transaction(
        instituteIds.map((instituteId, index) =>
            prisma.inist_account_institute.upsert({
                where: {
                    institute_id: instituteId,
                    inist_account_id: userId,
                    index,
                },
                update: {},
                create: {
                    institute_id: instituteId,
                    inist_account_id: userId,
                    index,
                },
            }),
        ),
    );
};

export const unassignInstituteFromInistAccount = function* (
    instituteIds,
    userId,
) {
    return yield prisma.$transaction(
        instituteIds.map((instituteId) =>
            prisma.inist_account_institute.delete({
                where: { institute_id: instituteId, inist_account_id: userId },
            }),
        ),
    );
};

export const batchUpsert = function* (batch) {
    return yield prisma.$transaction(
        batch.map((inistAccount) =>
            prisma.inist_account_institute.upsert({
                where: {
                    institute_id: inistAccount.institute_id,
                    inist_account: inistAccount.unit_id,
                },
                update: inistAccount,
                create: inistAccount,
            }),
        ),
    );
};
