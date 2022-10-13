import prisma from '../../prisma/prisma';

export const assignCommunityToDatabase = function* (communityIds, databaseId) {
    return yield prisma.$transaction(
        communityIds.map((communityId) =>
            prisma.database_community.upsert({
                where: { community_id: communityId, database_id: databaseId },
                update: {},
                create: { community_id: communityId, database_id: databaseId },
            }),
        ),
    );
};

export const unassignCommunityFromDatabase = function* (
    communityIds,
    databaseId,
) {
    return yield prisma.$transaction(
        communityIds.map((communityId) =>
            prisma.database_community.delete({
                where: { community_id: communityId, database_id: databaseId },
            }),
        ),
    );
};
