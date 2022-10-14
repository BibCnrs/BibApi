import prisma from '../../prisma/prisma';
import checkEntityExists from './checkEntityExists';

const DEFAULT_TABLE = 'community';

export const getCommunities = function* (where = {}) {
    return yield prisma.community.findMany({
        where,
    });
};

export const selectOneByName = function* (name) {
    const community = yield prisma[DEFAULT_TABLE].findUnique({
        where: {
            name: name,
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
    });
    checkEntityExists('Communities', 'name', names, communities);

    return communities;
};

export const selectOneByGate = function* (gate) {
    const community = yield prisma[DEFAULT_TABLE].findUnique({
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
    return yield prisma[DEFAULT_TABLE].findMany({
        where: {
            janus_account_community: {
                some: { janus_account_id: janusAccountId },
            },
        },
        orderBy: {
            id: 'asc',
        },
    });
};

export const selectByInistAccountId = function* (inistAccountId) {
    return yield prisma[DEFAULT_TABLE].findMany({
        where: {
            inist_account_community: {
                some: { inist_account_id: inistAccountId },
            },
        },
        orderBy: {
            id: 'asc',
        },
    });
};

export const selectByInstituteId = function* (instituteId) {
    return yield prisma[DEFAULT_TABLE].findMany({
        where: {
            institute_community: {
                some: { institute_id: instituteId },
            },
        },
        orderBy: {
            id: 'asc',
        },
    });
};

export const selectByUnitId = function* (unitId) {
    const communities = yield prisma[DEFAULT_TABLE].findMany({
        include: {
            unit_community: {
                select: {
                    unit_id: true,
                    index: true,
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
    for (const community of communities) {
        community.index = community.unit_community[0].index;
        community.unit_id = community.unit_community[0].unit_id;
        delete community.unit_community;
    }
    return communities;
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
