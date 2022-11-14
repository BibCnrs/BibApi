import prisma from '../prisma/prisma';
import {
    selectByDatabaseId,
    selectByIds as selectDatabaseByIds,
} from './Community';
import {
    assignCommunityToDatabase,
    unassignCommunityFromDatabase,
} from './DatabaseCommunity';
import entityAssigner from './entityAssigner';

export const updateCommunities = entityAssigner(
    selectDatabaseByIds,
    selectByDatabaseId,
    unassignCommunityFromDatabase,
    assignCommunityToDatabase,
);

export const insertOne = function* (database) {
    const { communities: databaseCommunities, ...databaseData } = database;
    const insertedDatabase = yield prisma.database.create({
        data: databaseData,
    });
    const communities = yield updateCommunities(
        databaseCommunities,
        insertedDatabase.id,
    );

    return {
        ...insertedDatabase,
        communities,
    };
};

export const updateOne = function* (databaseId, database) {
    const { communities: databaseCommunities, ...databaseData } = database;
    const updatedDatabase = yield prisma.database.update({
        where: { id: parseInt(databaseId) },
        data: databaseData,
    });

    const communities = yield updateCommunities(
        databaseCommunities,
        updatedDatabase.id,
    );

    return {
        ...updatedDatabase,
        communities,
    };
};

export const transformCommunities = function (database) {
    if (database.communities) {
        let domains = [];
        let communitiesIds = [];
        database.communities.forEach((item) => {
            domains.push(item.community.name);
            communitiesIds.push(item.community.id);
        });
        database.domains = domains;
        database.communities = communitiesIds;
    }
    return database;
};

export const selectOne = function* (databaseId) {
    const database = yield prisma.database.findUnique({
        where: { id: parseInt(databaseId) },
        include: {
            communities: {
                include: {
                    community: {
                        select: {
                            name: true,
                            id: true,
                        },
                    },
                },
            },
        },
    });

    if (!database) {
        throw new Error('not found');
    }

    return transformCommunities(database);
};

export const getDatabases = function* (where = {}) {
    const data = yield prisma.database.findMany({
        include: {
            communities: {
                include: {
                    community: {
                        select: {
                            name: true,
                            id: true,
                        },
                    },
                },
            },
        },
        where,
    });

    return data.map(transformCommunities);
};
