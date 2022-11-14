import prisma from '../prisma/prisma';

export const assignCommunityToInstitute = function* (
    communityIds,
    instituteId,
) {
    return yield prisma.$transaction(
        communityIds.map((communityId, index) =>
            prisma.institute_community.upsert({
                where: {
                    institute_id_community_id: {
                        community_id: communityId,
                        institute_id: instituteId,
                    },
                },
                update: {},
                create: {
                    community_id: communityId,
                    institute_id: instituteId,
                    index,
                },
            }),
        ),
    );
};

export const unassignCommunityFromInstitute = function* (
    communityIds,
    instituteId,
) {
    return yield prisma.$transaction(
        communityIds.map((communityId) =>
            prisma.institute_community.delete({
                where: {
                    institute_id_community_id: {
                        community_id: communityId,
                        institute_id: instituteId,
                    },
                },
            }),
        ),
    );
};
