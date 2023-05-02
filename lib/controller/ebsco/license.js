import prisma from '../../prisma/prisma';
const DEFAULT_TABLE = 'license';

export const getLicenses = function* domains() {
    const query = this.request.query;
    const domains = query.domains.split(',') || [];
    const take = parseInt(query._perPage) || undefined;
    const offset = query._page ? (parseInt(query._page) - 1) * take : undefined;

    const data = yield prisma[DEFAULT_TABLE].findMany({
        skip: offset || 0,
        take: take || 100,
        where: {
            license_community: {
                some: {
                    community: {
                        name: {
                            in: domains,
                        },
                    },
                },
            },
            enable: true,
        },
        orderBy: [
            {
                common: 'desc',
            },
            {
                name_fr: 'asc',
            },
        ],
    });

    this.body = data;
};
