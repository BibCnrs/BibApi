import prisma from '../prisma/prisma';
import checkEntityExists from './checkEntityExists';

const DEFAULT_TABLE = 'community';

export const getCommunities = function* (where = {}) {
    return yield prisma.community.findMany({
        where,
    });
};

export const selectOne = function* (id) {
    const community = yield prisma[DEFAULT_TABLE].findUnique({
        where: {
            id: parseInt(id),
        },
    });
    if (!community) {
        const error = new Error(`Community ${id}} does not exists`);
        error.status = 500;
        throw error;
    }

    return community;
};

export const updateOne = function* (id, data) {
    return yield prisma[DEFAULT_TABLE].update({
        where: {
            id: parseInt(id),
        },
        data: data,
    });
};

export const insertMany = function* (data) {
    return yield prisma[DEFAULT_TABLE].createMany({
        data,
    });
};

export const selectOneByName = function* (name) {
    const community = yield prisma[DEFAULT_TABLE].findUnique({
        where: {
            name: decodeURIComponent(name.replace(/\+/g, ' ')),
        },
    });
    if (!community) {
        const error = new Error(`Community ${name} does not exists`);
        error.status = 500;
        throw error;
    }

    return community;
};

export const selectByNames = function* (names) {
    const communities = yield prisma[DEFAULT_TABLE].findMany({
        where: {
            name: {
                in: names,
            },
        },
        orderBy: {
            id: 'asc',
        },
    });
    checkEntityExists('Communities', 'name', names, communities);

    return communities;
};

export const selectOneByGate = function* (gate) {
    const community = yield prisma[DEFAULT_TABLE].findFirst({
        where: {
            gate: gate,
        },
    });

    if (!community) {
        const error = new Error(`Community does not exists`);
        error.status = 500;
        throw error;
    }

    return community;
};

export const selectByIds = function* (ids) {
    const communities = yield prisma[DEFAULT_TABLE].findMany({
        where: {
            id: {
                in: ids,
            },
        },
    });
    checkEntityExists('Communities', 'id', ids, communities);

    return communities;
};

export const selectByJanusAccountId = function* (janusAccountId) {
    const communities = yield prisma[DEFAULT_TABLE].findMany({
        select: {
            id: true,
            name: true,
            gate: true,
            ebsco: true,
            password: true,
            user_id: true,
            profile: true,
            janus_account_community: {
                select: {
                    index: true,
                    janus_account_id: true,
                },
                where: {
                    janus_account_id: janusAccountId,
                },
            },
        },
        where: {
            janus_account_community: {
                some: { janus_account_id: janusAccountId },
            },
        },
        orderBy: {
            id: 'asc',
        },
    });

    return communities.map((community) => ({
        id: community.id,
        name: community.name,
        gate: community.gate,
        ebsco: community.ebsco,
        janus_account_id: community.janus_account_community[0].janus_account_id,
        index: community.janus_account_community[0].index,
        password: community.password,
        user_id: community.user_id,
        profile: community.profile,
    }));
};

export const selectByInistAccountId = function* (inistAccountId) {
    const communities = yield prisma[DEFAULT_TABLE].findMany({
        select: {
            id: true,
            name: true,
            gate: true,
            ebsco: true,
            password: true,
            user_id: true,
            profile: true,
            inist_account_community: {
                select: {
                    index: true,
                    inist_account_id: true,
                },
                where: {
                    inist_account_id: inistAccountId,
                },
            },
        },
        where: {
            inist_account_community: {
                some: { inist_account_id: inistAccountId },
            },
        },
        orderBy: {
            id: 'asc',
        },
    });

    return communities.map((community) => ({
        id: community.id,
        name: community.name,
        gate: community.gate,
        ebsco: community.ebsco,
        inist_account_id: community.inist_account_community[0].inist_account_id,
        index: community.inist_account_community[0].index,
        password: community.password,
        user_id: community.user_id,
        profile: community.profile,
    }));
};

export const selectByInstituteId = function* (instituteId) {
    const communities = yield prisma[DEFAULT_TABLE].findMany({
        select: {
            id: true,
            name: true,
            gate: true,
            ebsco: true,
            password: true,
            user_id: true,
            profile: true,
            institute_community: {
                select: {
                    index: true,
                    institute_id: true,
                },
                where: {
                    institute_id: instituteId,
                },
            },
        },
        where: {
            institute_community: {
                some: { institute_id: instituteId },
            },
        },
        orderBy: {
            id: 'asc',
        },
    });

    return communities.map((community) => ({
        id: community.id,
        name: community.name,
        gate: community.gate,
        ebsco: community.ebsco,
        institute_id: community.institute_community[0].institute_id,
        index: community.institute_community[0].index,
        password: community.password,
        user_id: community.user_id,
        profile: community.profile,
    }));
};

export const selectByUnitId = function* (unitId) {
    const communities = yield prisma[DEFAULT_TABLE].findMany({
        select: {
            id: true,
            name: true,
            gate: true,
            ebsco: true,
            password: true,
            user_id: true,
            profile: true,
            unit_community: {
                select: {
                    index: true,
                    unit_id: true,
                },
                where: {
                    unit_id: unitId,
                },
            },
        },
        where: {
            unit_community: {
                some: { unit_id: unitId },
            },
        },
        orderBy: {
            id: 'asc',
        },
    });

    return communities.map((community) => ({
        id: community.id,
        name: community.name,
        gate: community.gate,
        ebsco: community.ebsco,
        unit_id: community.unit_community[0].unit_id,
        index: community.unit_community[0].index,
        password: community.password,
        user_id: community.user_id,
        profile: community.profile,
    }));
};

export const selectByDatabaseId = function* (databaseId) {
    return yield prisma[DEFAULT_TABLE].findMany({
        where: {
            database_community: {
                some: { database_id: databaseId },
            },
        },
        orderBy: {
            id: 'asc',
        },
    });
};

export const selectByRevueId = function* (revueId) {
    return yield prisma[DEFAULT_TABLE].findMany({
        where: {
            revue_community: {
                revue_id: revueId,
            },
        },
        orderBy: {
            id: 'asc',
        },
    });
};

export const insertOne = function* (data) {
    return yield prisma[DEFAULT_TABLE].create({
        data: data,
    });
};
