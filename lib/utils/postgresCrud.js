import koa from 'koa';
import coBody from 'co-body';
import koaRoute from 'koa-route';
import prisma from '../../prisma/prisma';

const postgresCrud = (
    defaultTable,
    availableMethods = ['GET', 'POST', 'PUT', 'DELETE'],
) => {
    const app = new koa();

    app.use(function* (next) {
        const clean = (method) => method.toLowerCase().trim();
        const method = clean(this.method);
        const isAllowed = availableMethods.map(clean).indexOf(method) !== -1;

        if (!isAllowed) {
            this.status = 405; // Method Not Allowed
            this.body = {};
            return;
        }

        yield next;
    });

    // GET /
    app.use(
        koaRoute.get('/', function* () {
            const query = this.request.query;
            const filters = JSON.parse(query._filters || '{}');
            const limit = query._perPage;
            const offset = (query._page - 1) * query._perPage;

            const data = yield prisma[defaultTable].findMany({
                skip: offset || 0,
                take: limit || 100,
                where: filters,
                orderBy: {
                    [query._sortField]: query._sortDir,
                },
            });

            const total = yield prisma[defaultTable].count();

            this.body = data;
            this.set('Content-Range', total);
            this.set('Access-Control-Expose-Headers', 'Content-Range');
        }),
    );

    // GET /:id
    app.use(
        koaRoute.get('/:id', function* (id) {
            try {
                this.body = yield prisma[defaultTable].findUnique({
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

    // POST /
    app.use(
        koaRoute.post('/', function* () {
            const data = this.data || (yield coBody(this));
            this.body = yield prisma[defaultTable].create({
                data: data,
            });
        }),
    );

    // POST /multi
    app.use(
        koaRoute.post('/multi', function* () {
            const data = this.data || (yield coBody(this));
            this.body = yield prisma[defaultTable].createMany({
                data: data,
            });
        }),
    );

    // DELETE /
    app.use(
        koaRoute.delete('/:id', function* (id) {
            try {
                this.body = yield prisma[defaultTable].delete({
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
        koaRoute.delete('/multi', function* () {
            const ids = this.query.id;
            this.body = yield prisma[defaultTable].delete({
                where: {
                    id: { in: ids },
                },
            });
        }),
    );

    // PUT /:id
    app.use(
        koaRoute.put('/:id', function* (id) {
            const data = this.data || (yield coBody(this));
            let modifiedEntity;
            try {
                modifiedEntity = yield prisma[defaultTable].update({
                    where: {
                        id: parseInt(id),
                    },
                    data: data,
                });
            } catch (e) {
                if (e.message === 'not found') {
                    this.status = 404;
                    return;
                }

                throw e;
            }
            this.body = modifiedEntity;
        }),
    );

    return app;
};

export default postgresCrud;
