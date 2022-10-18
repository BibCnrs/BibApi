import {
    selectByInstituteId,
    selectByIds as selectCommunitiesByIds,
} from './Community';
import checkEntityExists from './checkEntityExists';
import entityAssigner from './entityAssigner';
import prisma from '../prisma/prisma';
import {
    assignCommunityToInstitute,
    unassignCommunityFromInstitute,
} from './InstituteCommunity';

export const selectOne = function* (instituteId) {
    const institute = yield prisma.institute.findUnique({
        where: {
            id: parseInt(instituteId),
        },
        include: {
            institute_community: {
                include: {
                    community: {
                        select: {
                            id: true,
                        },
                    },
                },
            },
        },
    });

    institute.communities = institute.institute_community.map(
        (instituteCommunity) => instituteCommunity.community.id,
    );
    delete institute.institute_community;
    return institute;
};

export const selectOneByCode = function* (code) {
    return yield prisma.institute.findUnique({
        where: {
            code,
        },
    });
};

export const selectByJanusAccountId = function* (userId) {
    const data = yield prisma.institute.findMany({
        select: {
            id: true,
            code: true,
            name: true,
            janus_account_institute: {
                select: {
                    index: true,
                    janus_account_id: true,
                },
                where: {
                    janus_account_id: parseInt(userId),
                },
            },
        },
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

    return data.map((institute) => ({
        id: institute.id,
        code: institute.code,
        janus_account_id: institute.janus_account_institute[0].janus_account_id,
        name: institute.name,
        index: institute.janus_account_institute[0].index,
    }));
};

export const selectByInistAccountId = function* (inistAccountId) {
    const data = yield prisma.institute.findMany({
        select: {
            id: true,
            code: true,
            name: true,
            inist_account_institute: {
                select: {
                    index: true,
                    inist_account_id: true,
                },
                where: {
                    inist_account_id: parseInt(inistAccountId),
                },
            },
        },
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
    return data.map((institute) => ({
        id: institute.id,
        code: institute.code,
        inist_account_id: institute.inist_account_institute[0].inist_account_id,
        name: institute.name,
        index: institute.inist_account_institute[0].index,
    }));
};

export const selectByUnitId = function* (unitId) {
    const data = yield prisma.institute.findMany({
        select: {
            id: true,
            code: true,
            name: true,
            unit_institute: {
                select: {
                    index: true,
                    unit_id: true,
                },
                where: {
                    unit_id: parseInt(unitId),
                },
            },
        },
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
    return data.map((institute) => ({
        id: institute.id,
        code: institute.code,
        unit_id: institute.unit_institute[0].unit_id,
        name: institute.name,
        index: institute.unit_institute[0].index,
    }));
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
    const { communities: communitiesInstitute, ...data } = institute;
    const updatedInstitute = yield prisma.institute.update({
        where: { id: parseInt(instituteId) },
        data,
    });

    const communities = yield updateCommunities(
        communitiesInstitute,
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
    return yield prisma.institute.upsert({
        where: { code: institute.code },
        update: institute,
        create: institute,
    });
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
    const data = yield prisma.$queryRaw`SELECT id, institute_id, code, name
    FROM institute JOIN section_cn_secondary_institute ON (institute.id = section_cn_secondary_institute.institute_id)
    WHERE  section_cn_secondary_institute.section_cn_id = ${sectionCNId}`;
    return data;
};
