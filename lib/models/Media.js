import prisma from '../prisma/prisma';

export const selectOne = function* (id) {
    return yield prisma.medias.findUnique({
        where: {
            id: parseInt(id),
        },
    });
};

export const insertOne = function* (data) {
    return yield prisma.medias.create({
        data: data,
    });
};

export const updateOne = function* (id, data) {
    return yield prisma.medias.update({
        where: {
            id: parseInt(id),
        },
        data: data,
    });
};
