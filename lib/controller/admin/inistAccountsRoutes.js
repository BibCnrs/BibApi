import CoBody from 'co-body';
import koa from 'koa';
import route from 'koa-route';
import prisma from '../../prisma/prisma';
import {
    insertOne,
    selectAllForExport,
    selectOne,
    updateOne,
} from '../../models/InistAccount';
import { transformFilters } from '../../utils/filter';
import { transformOrderBy } from '../../utils/order';

const app = new koa();
const DEFAULT_TABLE = 'inist_account';

export const getAllForExport = function* (next) {
    if (!this.query || this.query._perPage != 100000) {
        yield next;
        return;
    }
    this.body = yield selectAllForExport();

    const totalCount = this.body.length;
    this.set('Content-Range', totalCount);
    this.set('Access-Control-Expose-Headers', 'Content-Range');
};

app.use(route.get('/', getAllForExport));

app.use(
    route.get('/', function* () {
        const query = this.request.query;
        let filters = JSON.parse(query._filters || '{}');
        const take = parseInt(query._perPage) || undefined;
        const offset = query._page
            ? (parseInt(query._page) - 1) * take
            : undefined;

        filters = transformFilters(filters, [
            { field: 'username', mode: 'contains' },
            { field: 'password', mode: 'contains' },
            { field: 'name', mode: 'contains' },
            { field: 'firstname', mode: 'contains' },
            { field: 'mail', mode: 'contains' },
            { field: 'main_institute', mode: 'equals', excludeMatch: true },
            { field: 'main_unit', mode: 'equals', excludeMatch: true },
            {
                field: 'inist_account_community.community_id',
                mode: 'equals',
                excludeMatch: true,
            },
            {
                field: 'inist_account_institute.institute_id',
                mode: 'equals',
                excludeMatch: true,
            },
            {
                field: 'inist_account_unit.unit_id',
                mode: 'equals',
                excludeMatch: true,
            },
            { field: 'subscription_date_lte', mode: 'lte', excludeMatch: true },
            { field: 'subscription_date_gte', mode: 'gte', excludeMatch: true },
            { field: 'expiration_date_lte', mode: 'lte', excludeMatch: true },
            { field: 'expiration_date_gte', mode: 'gte', excludeMatch: true },
            { field: 'last_connexion_lte', mode: 'lte', excludeMatch: true },
            { field: 'last_connexion_gte', mode: 'gte', excludeMatch: true },
            { field: 'active', mode: 'equals', excludeMatch: true },
        ]);

        const orderBy = transformOrderBy(query._sortField, query._sortDir);

        const data = yield prisma[DEFAULT_TABLE].findMany({
            skip: offset || 0,
            take: take || 100,
            where: filters,
            orderBy,
            include: {
                inist_account_community: {
                    select: {
                        community_id: true,
                    },
                },
                inist_account_institute: {
                    select: {
                        institute_id: true,
                    },
                },
            },
        });

        for (const account of data) {
            account.institutes = account.inist_account_institute.map(
                (institute) => institute.institute_id,
            );
            account.communities = account.inist_account_community.map(
                (community) => community.community_id,
            );
            delete account.inist_account_institute;
            delete account.inist_account_community;
        }

        const total = yield prisma[DEFAULT_TABLE].count({
            where: filters,
        });

        this.body = data;
        this.set('Content-Range', total);
        this.set('Access-Control-Expose-Headers', 'Content-Range');
    }),
);

app.use(
    route.get('/:id', function* (id) {
        try {
            this.body = yield selectOne(id);
        } catch (e) {
            if (e.message === 'not found') {
                this.status = 404;
            } else {
                throw e;
            }
        }
    }),
);

app.use(
    route.post('/', function* () {
        const data = this.data || (yield CoBody(this));
        this.body = yield insertOne(data);
    }),
);

app.use(
    route.delete('/:id', function* (id) {
        try {
            this.body = yield prisma[DEFAULT_TABLE].delete({
                where: {
                    id: parseInt(id),
                },
            });
        } catch (e) {
            if (e.message === 'not found') {
                this.status = 404;
            } else {
                throw e;
            }
        }
    }),
);

// DELETE /multi
app.use(
    route.delete('/multi', function* () {
        const ids = this.query.id;
        this.body = yield prisma[DEFAULT_TABLE].delete({
            where: {
                id: { in: ids },
            },
        });
    }),
);

// PUT /:id
app.use(
    route.put('/:id', function* (id) {
        const data = this.data || (yield CoBody(this));
        this.body = yield updateOne(id, data);
    }),
);

export default app;
