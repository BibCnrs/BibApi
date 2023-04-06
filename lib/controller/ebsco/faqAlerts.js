import prisma from '../../prisma/prisma';
const DEFAULT_TABLE = 'faq_alerts';

const getNow = () => {
    const now = new Date().toISOString().slice(0, 10);
    return new Date(now);
};

export const getFaqAlerts = function* () {
    const query = this.request.query;
    const page = query.page || '';

    const data = yield prisma[DEFAULT_TABLE].findMany({
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

    this.body = data;
};
