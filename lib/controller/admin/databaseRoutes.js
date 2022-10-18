import CoBody from 'co-body';
import koa from 'koa';
import route from 'koa-route';
import prisma from '../../prisma/prisma';
import {
    insertOne,
    selectOne,
    transformCommunities,
    updateOne,
} from '../../models/Database';
import { transformFilters } from '../../utils/filter';

const app = new koa();
const DEFAULT_TABLE = 'database';

app.use(
    route.get('/', function* () {
        const query = this.request.query;
        let filters = JSON.parse(query._filters || '{}');
        const take = parseInt(query._perPage) || undefined;
        const offset = query._page
            ? (parseInt(query._page) - 1) * take
            : undefined;

        if (filters) {
            // transform filters for Prisma
            filters = transformFilters(filters, [
                { field: 'name_fr', mode: 'contains' },
                { field: 'text_fr', mode: 'contains' },
                { field: 'text_en', mode: 'contains' },
                { field: 'url_fr', mode: 'contains' },
                { field: 'url_en', mode: 'contains' },
                { field: 'active', mode: 'equals', excludeMatch: true },
                { field: 'oa', mode: 'equals', excludeMatch: true },
                { field: 'use_proxy', mode: 'equals', excludeMatch: true },
            ]);
        }
        let data = yield prisma[DEFAULT_TABLE].findMany({
            skip: offset || 0,
            take: take || 100,
            where: filters,
            orderBy: {
                [query._sortField]: query._sortDir,
            },
            include: {
                communities: {
                    include: {
                        community: {
                            select: {
                                name: true,
                                id: true,
                            },
                        },
                    },
                },
            },
        });

        data = data.map(transformCommunities);

        const total = yield prisma[DEFAULT_TABLE].count({ where: filters });

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
        if (data.domains) {
            delete data.domains;
        }
        this.body = yield updateOne(id, data);
    }),
);

export default app;
