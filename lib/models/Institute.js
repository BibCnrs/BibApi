import {
    selectByInstituteId,
    selectByIds as selectCommunitiesByIds,
} from './Community';
import checkEntityExists from './checkEntityExists';
import entityAssigner from './entityAssigner';
import prisma from '../../prisma/prisma';
import {
    assignCommunityToInstitute,
    unassignCommunityFromInstitute,
} from './InstituteCommunity';

export const selectOne = function* (instituteId) {
    return yield prisma.institute.findUnique({
        where: {
            id: instituteId,
        },
    });
};

export const selectOneByCode = function* (code) {
    return yield prisma.institute.findUnique({
        where: {
            code,
        },
    });
};

export const selectByJanusAccountId = function* (userId) {
    return yield prisma.institute.findMany({
        where: {
            janus_account_institute: {
                some: {
                    janus_account_id: parseInt(userId),
                },
            },
        },
        orderBy: {
            id: 'asc',
        },
    });
};

export const selectByInistAccountId = function* (inistAccountId) {
    return yield prisma.institute.findMany({
        where: {
            inist_account_institute: {
                some: {
                    inist_account_id: parseInt(inistAccountId),
                },
            },
        },
        orderBy: {
            id: 'asc',
        },
    });
};

export const selectByUnitId = function* (unitId) {
    return yield prisma.institute.findMany({
        where: {
            unit_institute: {
                some: {
                    unit_id: parseInt(unitId),
                },
            },
        },
        orderBy: {
            id: 'asc',
        },
    });
};

export const updateCommunities = entityAssigner(
    selectCommunitiesByIds,
    selectByInstituteId,
    unassignCommunityFromInstitute,
    assignCommunityToInstitute,
);

export const insertOne = function* insertOne(institute) {
    const { communities: institueCommunities, ...data } = institute;
    const insertedInstitute = yield prisma.institute.create({
        data,
    });

    const communities = yield updateCommunities(
        institute.communities,
        insertedInstitute.id,
    );

    return {
        ...insertedInstitute,
        communities,
    };
};

export const updateOne = function* (instituteId, institute) {
    const updatedInstitute = yield prisma.institute.update({
        where: { id: instituteId },
        data: institute,
    });

    const communities = yield updateCommunities(
        institute.communities,
        updatedInstitute.id,
    );

    return {
        ...updatedInstitute,
        communities,
    };
};

export const selectByIds = function* (ids) {
    const institutes = yield prisma.institute.findMany({
        where: {
            id: {
                in: ids,
            },
        },
    });
    checkEntityExists('Institutes', 'id', ids, institutes);

    return institutes;
};

export const selectByCodes = function* (codes) {
    const institutes = yield prisma.institute.findMany({
        where: {
            code: {
                in: codes,
            },
        },
    });
    checkEntityExists('Institutes', 'code', codes, institutes);

    return institutes;
};

export const insertInstituteIfNotExists = function* (code, name) {
    if (!code) {
        return null;
    }
    let institute = yield prisma.institute.findFirst({
        where: {
            code,
        },
    });
    if (institute) {
        return institute;
    }

    return yield insertOne({ code, name });
};

export const getInstitutes = function* (options = {}) {
    const { offset, take, order, filters } = options;
    const institutes = yield prisma.institute.findMany({
        skip: offset,
        take: take,
        where: filters,
        orderBy: order,
        include: {
            institute_community: {
                select: {
                    community_id: true,
                },
            },
        },
    });
    for (const institute of institutes) {
        institute.communities = institute.institute_community.map(
            (item) => item.community_id,
        );
        delete institute.institute_community;
    }
    return institutes;
};

export const upsertOnePerCode = function* (institute) {
    const { code, name } = institute;
    const existingInstitute = yield prisma.institute.findFirst({
        where: {
            code,
            name,
        },
    });
    if (existingInstitute) {
        return existingInstitute;
    }
    return yield insertOne({ code, name });
};

export const selectPrimaryBySectionCNId = function* (sectionCNId) {
    return yield prisma.institute.findFirst({
        where: {
            section_cn_primary_institute: {
                some: {
                    section_cn_id: parseInt(sectionCNId),
                },
            },
        },
    });
};

export const selectSecondaryBySectionCNId = function* (sectionCNId) {
    return yield prisma.institute.findFirst({
        where: {
            section_cn_secondary_institute: {
                some: {
                    section_cn_id: parseInt(sectionCNId),
                },
            },
        },
    });
};
