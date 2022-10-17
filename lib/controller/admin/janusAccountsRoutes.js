import CoBody from 'co-body';
import koa from 'koa';
import route from 'koa-route';
import prisma from '../../../prisma/prisma';
import {
    insertOne,
    selectAllForExport,
    selectOne,
    updateOne,
} from '../../models/JanusAccount';

const app = new koa();
const DEFAULT_TABLE = 'janus_account';

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
        const filters = JSON.parse(query._filters || '{}');
        const take = parseInt(query._perPage) || undefined;
        const offset = query._page
            ? (parseInt(query._page) - 1) * take
            : undefined;

        const data = yield prisma[DEFAULT_TABLE].findMany({
            skip: offset || 0,
            take: take || 100,
            where: filters,
            orderBy: {
                [query._sortField]: query._sortDir,
            },
        });

        const total = yield prisma[DEFAULT_TABLE].count();

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
