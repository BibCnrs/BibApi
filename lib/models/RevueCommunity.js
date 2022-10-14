import prisma from '../../prisma/prisma';

export const assignCommunityToRevue = function* (communityIds, revueId) {
    return yield prisma.$transaction(
        communityIds.map((communityId) =>
            prisma.revue_community.upsert({
                where: { community_id: communityId, revue_id: revueId },
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
                where: { community_id: communityId, revue_id: revueId },
            }),
        ),
    );
};
