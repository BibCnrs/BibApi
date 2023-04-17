import prisma from '../../prisma/prisma';

const DEFAULT_TABLE = 'content_management';

const getNow = () => {
    const now = new Date().toISOString().slice(0, 10);
    return new Date(now);
};

export const getContent = function* () {
    const query = this.request.query;
    const page = query.page || '';
    const first = query.first ? 1 : 100;

    this.body = yield prisma[DEFAULT_TABLE].findMany({
        take: first,
        where: {
            AND: {
                page: page,
                enable: true,
            },
            OR: [
                {
                    to: {
                        gte: getNow(),
                    },
                },
                {
                    to: null,
                },
            ],
        },
        orderBy: [
            {
                from: 'asc',
            },
        ],
    });
};
