import prisma from '../prisma/prisma';

export const assignInstituteToJanusAccount = function* (instituteIds, userId) {
    return yield prisma.$transaction(
        instituteIds.map((instituteId, index) =>
            prisma.janus_account_institute.upsert({
                where: {
                    institute_id_janus_account_id: {
                        institute_id: instituteId,
                        janus_account_id: userId,
                    },
                },
                update: {},
                create: {
                    institute_id: instituteId,
                    janus_account_id: userId,
                    index,
                },
            }),
        ),
    );
};

export const unassignInstituteFromJanusAccount = function* (
    instituteIds,
    userId,
) {
    return yield prisma.$transaction(
        instituteIds.map((instituteId) =>
            prisma.janus_account_institute.delete({
                where: {
                    institute_id_janus_account_id: {
                        institute_id: instituteId,
                        janus_account_id: userId,
                    },
                },
            }),
        ),
    );
};
