import prisma from '../../prisma/prisma';

export const assignCommunityToInstitute = function* (
    communityIds,
    instituteId,
) {
    return yield prisma.$transaction(
        communityIds.map((communityId) =>
            prisma.institute_community.upsert({
                where: {
                    community_id_institute_id: {
                        community_id: communityId,
                        institute_id: instituteId,
                    },
                },
                update: {},
                create: {
                    community_id: communityId,
                    institute_id: instituteId,
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
                    community_id_institute_id: {
                        community_id: communityId,
                        institute_id: instituteId,
                    },
                },
            }),
        ),
    );
};
