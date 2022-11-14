import prisma from '../prisma/prisma';

export const assignCommunityToJanusAccount = function* (communityIds, userId) {
    return yield prisma.$transaction(
        communityIds.map((communityId, index) =>
            prisma.janus_account_community.upsert({
                where: {
                    janus_account_id_community_id: {
                        community_id: communityId,
                        janus_account_id: userId,
                    },
                },
                update: {},
                create: {
                    community_id: communityId,
                    janus_account_id: userId,
                    index,
                },
            }),
        ),
    );
};

export const unassignCommunityFromJanusAccount = function* (
    communityIds,
    userId,
) {
    return yield prisma.$transaction(
        communityIds.map((communityId) =>
            prisma.janus_account_community.delete({
                where: {
                    janus_account_id_community_id: {
                        community_id: communityId,
                        janus_account_id: userId,
                    },
                },
            }),
        ),
    );
};
