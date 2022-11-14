import CoBody from 'co-body';
import koa from 'koa';
import route from 'koa-route';
import prisma from '../../prisma/prisma';
import {
    getInstitutes,
    insertOne,
    selectOne,
    updateOne,
} from '../../models/Institute';
import { transformFilters } from '../../utils/filter';

const app = new koa();
const DEFAULT_TABLE = 'institute';

app.use(
    route.get('/', function* () {
        const query = this.request.query;
        let filters = JSON.parse(query._filters || '{}');
        const take = parseInt(query._perPage) || undefined;
        const offset = query._page
            ? (parseInt(query._page) - 1) * take
            : undefined;
        const order = {
            [query._sortField]: query._sortDir,
        };

        if (filters) {
            // transform filters for Prisma
            filters = transformFilters(filters, [
                { field: 'id', mode: 'equals' },
                { field: 'code', mode: 'contains' },
                { field: 'name', mode: 'contains' },
                {
                    field: 'institute_community.community_id',
                    mode: 'equals',
                    excludeMatch: true,
                },
            ]);
        }

        const data = yield getInstitutes({ offset, take, order, filters });
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
        this.body = yield updateOne(id, data);
    }),
);

export default app;
