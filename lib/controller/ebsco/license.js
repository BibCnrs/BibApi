import prisma from '../../prisma/prisma';
import { transformFilters } from '../../utils/filter';
const DEFAULT_TABLE = 'license';

export const getLicenses = function* domains() {
    const query = this.request.query;
    let filters = JSON.parse(query._filters || '{}');
    if (filters) {
        // transform filters for Prisma
        filters = transformFilters(filters, [
            { field: 'name', mode: 'contains' },
            {
                field: 'licence_community.community.id',
                mode: 'equals',
                excludeBatch: true,
            },
        ]);
    }

    const take = parseInt(query._perPage) || undefined;
    const offset = query._page ? (parseInt(query._page) - 1) * take : undefined;

    const data = yield prisma[DEFAULT_TABLE].findMany({
        skip: offset || 0,
        take: take || 100,
        where: filters,
        include: {
            license_community: {
                include: {
                    community: true,
                },
            },
        },
        orderBy: {
            [query._sortField]: query._sortDir,
        },
    });

    const total = yield prisma[DEFAULT_TABLE].count({ where: filters });

    this.body = data;
    this.set('Content-Range', total);
    this.set('Access-Control-Expose-Headers', 'Content-Range');
};
