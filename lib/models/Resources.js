import prisma from '../prisma/prisma';
const DEFAULT_TABLE = 'resources';

export const selectOne = function* (id) {
    return yield prisma[DEFAULT_TABLE].findUnique({
        where: {
            id: parseInt(id),
        },
    });
};

export const insertOne = function* (data) {
    return yield prisma[DEFAULT_TABLE].create({
        data: {
            ...data,
            community: data.community ? data.community.toString() : 'other',
        },
    });
};

export const updateOne = function* (id, data) {
    return yield prisma[DEFAULT_TABLE].update({
        where: {
            id: parseInt(id),
        },
        data: {
            ...data,
            community: data.community ? data.community.toString() : 'other',
        },
    });
};
