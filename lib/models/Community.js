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
                janus_account_id: janusAccountId,
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
                inist_account_id: inistAccountId,
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
                institute_id: instituteId,
            },
        },
        orderBy: {
            id: 'asc',
        },
    });
};

export const selectByUnitId = function* (unitId) {
    return yield prisma[DEFAULT_TABLE].findMany({
        where: {
            unit_community: {
                unit_id: unitId,
            },
        },
        orderBy: {
            id: 'asc',
        },
    });
};

export const selectByDatabaseId = function* (databaseId) {
    return yield prisma[DEFAULT_TABLE].findMany({
        where: {
            database_community: {
                database_id: databaseId,
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
