import prisma from '../prisma/prisma';

export const assignCommunityToInistAccount = function* (communityIds, userId) {
    return yield prisma.$transaction(
        communityIds.map((communityId, index) => {
            return prisma.inist_account_community.upsert({
                where: {
                    inist_account_id_community_id: {
                        community_id: communityId,
                        inist_account_id: userId,
                    },
                },
                update: {},
                create: {
                    community_id: communityId,
                    inist_account_id: userId,
                    index,
                },
            });
        }),
    );
};

export const unassignCommunityFromInistAccount = function* (
    communityIds,
    userId,
) {
    return yield prisma.$transaction(
        communityIds.map((communityId) =>
            prisma.inist_account_community.delete({
                where: {
                    inist_account_id_community_id: {
                        community_id: communityId,
                        inist_account_id: userId,
                    },
                },
            }),
        ),
    );
};

export const batchUpsert = function* (batch) {
    return yield prisma.$transaction(
        batch.map((inistAccount) =>
            prisma.inist_account_community.upsert({
                where: {
                    inist_account_id_community_id: {
                        community_id: inistAccount.community_id,
                        inist_account: inistAccount.unit_id,
                    },
                },
                update: inistAccount,
                create: inistAccount,
            }),
        ),
    );
};
