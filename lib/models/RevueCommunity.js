import prisma from '../prisma/prisma';

export const assignCommunityToRevue = function* (communityIds, revueId) {
    return yield prisma.$transaction(
        communityIds.map((communityId) =>
            prisma.revue_community.upsert({
                where: {
                    revue_id_community_id: {
                        community_id: communityId,
                        revue_id: revueId,
                    },
                },
                update: {},
                create: { community_id: communityId, revue_id: revueId },
            }),
        ),
    );
};

export const unassignCommunityFromRevue = function* (communityIds, revueId) {
    return yield prisma.$transaction(
        communityIds.map((communityId) =>
            prisma.revue_community.delete({
                where: {
                    revue_id_community_id: {
                        community_id: communityId,
                        revue_id: revueId,
                    },
                },
            }),
        ),
    );
};
