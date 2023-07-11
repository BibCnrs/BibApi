import prisma from '../../prisma/prisma';

const DEFAULT_TABLE = 'tests_news';

const getNow = () => {
    const now = new Date().toISOString().slice(0, 10);
    return new Date(now);
};

export const getTestsNews = function* () {
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

export const getTestNew = function* (id) {
    this.body = yield prisma[DEFAULT_TABLE].findFirst({
        where: {
            AND: {
                id: parseInt(id, 10),
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
    });
    if (!this.body) {
        this.body = {};
        this.status = 404;
    }
};
