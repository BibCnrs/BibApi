import prisma from '../../prisma/prisma';

const DEFAULT_TABLE = 'resources';

export const getResources = function* () {
    this.body = yield prisma[DEFAULT_TABLE].findMany({
        where: {
            enable: true,
        },
    });
};
