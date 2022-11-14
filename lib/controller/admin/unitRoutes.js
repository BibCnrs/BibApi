import CoBody from 'co-body';
import koa from 'koa';
import route from 'koa-route';
import prisma from '../../prisma/prisma';
import { getUnits, insertOne, selectOne, updateOne } from '../../models/Unit';
import { transformFilters } from '../../utils/filter';
import { transformOrderBy } from '../../utils/order';

const app = new koa();
const DEFAULT_TABLE = 'unit';

app.use(
    route.get('/', function* () {
        const query = this.request.query;
        let filters = JSON.parse(query._filters || '{}');
        const take = parseInt(query._perPage) || undefined;
        const offset = query._page
            ? (parseInt(query._page) - 1) * take
            : undefined;

        const order = transformOrderBy(query._sortField, query._sortDir);

        if (filters) {
            // transform filters for Prisma
            filters = transformFilters(filters, [
                { field: 'code', mode: 'contains' },
                { field: 'comment', mode: 'contains' },
                { field: 'name', mode: 'contains' },
                { field: 'implantation', mode: 'contains' },
                { field: 'building', mode: 'contains' },
                { field: 'street', mode: 'contains' },
                { field: 'post_office_box', mode: 'contains' },
                { field: 'postal_code', mode: 'contains' },
                { field: 'country', mode: 'contains' },
                { field: 'unit_dr', mode: 'contains' },
                { field: 'director_name', mode: 'contains' },
                { field: 'director_firstname', mode: 'contains' },
                { field: 'director_mail', mode: 'contains' },
                { field: 'correspondant_documentaire', mode: 'contains' },
                { field: 'cd_phone', mode: 'contains' },
                { field: 'cd_mail', mode: 'contains' },
                { field: 'correspondant_informatique', mode: 'contains' },
                { field: 'ci_phone', mode: 'contains' },
                { field: 'ci_mail', mode: 'contains' },
                { field: 'body', mode: 'contains' },
                { field: 'active', mode: 'equals', excludeMatch: true },
                { field: 'main_institute', mode: 'equals', excludeMatch: true },
                {
                    field: 'unit_community.community_id',
                    mode: 'equals',
                    excludeMatch: true,
                },
                {
                    field: 'unit_institute.institute_id',
                    mode: 'equals',
                    excludeMatch: true,
                },
                {
                    field: 'unit_section_cn.section_cn_id',
                    mode: 'equals',
                    excludeMatch: true,
                },
            ]);
        }

        const data = yield getUnits({ offset, take, order, filters });
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
