import prisma from '../prisma/prisma';

export const assignCommunityToUnit = function* (communityIds, unitId) {
    return yield prisma.$transaction(
        communityIds.map((communityId, index) =>
            prisma.unit_community.upsert({
                where: {
                    unit_id_community_id: {
                        community_id: communityId,
                        unit_id: unitId,
                    },
                },
                update: {},
                create: { community_id: communityId, unit_id: unitId, index },
            }),
        ),
    );
};

export const unassignCommunityFromUnit = function* (communityIds, unitId) {
    return yield prisma.$transaction(
        communityIds.map((communityId) =>
            prisma.unit_community.delete({
                where: {
                    unit_id_community_id: {
                        community_id: communityId,
                        unit_id: unitId,
                    },
                },
            }),
        ),
    );
};

export const batchUpsert = function* (batch) {
    return yield prisma.$transaction(
        batch.map((unitCommunity) =>
            prisma.unit_community.upsert({
                where: {
                    unit_id_community_id: {
                        community_id: unitCommunity.community_id,
                        unit_id: unitCommunity.unit_id,
                    },
                },
                update: unitCommunity,
                create: unitCommunity,
            }),
        ),
    );
};
