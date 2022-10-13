import prisma from '../../prisma/prisma';

export const assignCommunityToUnit = function* (communityIds, unitId) {
    return yield prisma.$transaction(
        communityIds.map((communityId, index) =>
            prisma.unit_community.upsert({
                where: { community_id: communityId, unit_id: unitId, index },
                update: {},
                create: { community_id: communityId, unit_id: unitId, index },
            }),
        ),
    );
};

export const unassignCommunityFromUnit = function* (communityIds, unitId) {
    return yield prisma.$transaction(
        communityIds.map((communityId) =>
            prisma.unit_institute.delete({
                where: { community_id: communityId, unit_id: unitId },
            }),
        ),
    );
};
