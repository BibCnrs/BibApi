import prisma from '../../prisma/prisma';
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
    const insertedDatabase = yield prisma.database.create({
        data: database,
    });
    const communities = yield updateCommunities(
        database.communities,
        insertedDatabase.id,
    );

    return {
        ...insertedDatabase,
        communities,
    };
};

export const updateOne = function* (databaseId, inistAccount) {
    const updatedDatabase = yield prisma.database.update({
        where: { id: databaseId },
        data: inistAccount,
    });

    const communities = yield updateCommunities(
        inistAccount.communities,
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
    return yield prisma.database.findMany({
        where,
    });
};
