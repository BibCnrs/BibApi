import prisma from '../prisma/prisma';
const DEFAULT_TABLE = 'content_management';

const formatData = (data) => {
    const formattedData = {
        ...data,
        from: new Date(data.from),
    };
    if (data.to) {
        formattedData.to = new Date(data.to);
    }

    return formattedData;
};

export const selectOne = function* (id) {
    return yield prisma[DEFAULT_TABLE].findUnique({
        where: {
            id: parseInt(id),
        },
    });
};

export const insertOne = function* (data) {
    return yield prisma[DEFAULT_TABLE].create({
        data: formatData(data),
    });
};

export const updateOne = function* (id, data) {
    return yield prisma[DEFAULT_TABLE].update({
        where: {
            id: parseInt(id),
        },
        data: formatData(data),
    });
};
