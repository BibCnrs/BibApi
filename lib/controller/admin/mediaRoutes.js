import koa from 'koa';
import route from 'koa-route';
import bodyParser from 'koa-body';
import { renameSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import { insertOne, selectOne } from '../../models/Media';
import prisma from '../../prisma/prisma';
import CoBody from 'co-body';
import { updateOne } from '../../models/FaqAlerts';

const app = new koa();

app.use(
    bodyParser({
        formidable: { uploadDir: './uploads' },
        multipart: true,
        urlencoded: true,
    }),
);

app.use(
    route.get('/', function* () {
        const query = this.request.query;

        const take = parseInt(query._perPage) || undefined;
        const offset = query._page
            ? (parseInt(query._page) - 1) * take
            : undefined;

        const data = yield prisma.medias.findMany({
            skip: offset || 0,
            take: take || 100,
            orderBy: {
                [query._sortField]: query._sortDir,
            },
        });

        const total = yield prisma.medias.count();

        this.body = data;
        this.set('Content-Range', total);
        this.set('Access-Control-Expose-Headers', 'Content-Range');
    }),
);

app.use(
    route.post('/', function* () {
        const date = new Date();
        const filePath = `uploads/${date.getUTCFullYear()}/${
            date.getUTCMonth() + 1
        }/${date.getUTCDate()}`;
        if (existsSync(filePath)) {
            mkdirSync(filePath, {
                recursive: true,
            });
        }

        const data = {
            name: this.request.body.fields.name,
            file_name: this.request.body.files.file.name,
            file: filePath + '/' + this.request.body.files.file.name,
            url:
                process.env.BIBAPI_HOST +
                '/ebsco/media/' +
                filePath +
                '/' +
                this.request.body.files.file.name,
        };

        renameSync(this.request.body.files.file.path, data.file);
        this.body = yield insertOne(data);
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
    route.delete('/:id', function* (id) {
        try {
            const element = yield selectOne(id);
            unlinkSync(element.file);
            this.body = yield prisma.medias.delete({
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

app.use(
    route.put('/:id', function* (id) {
        const data = this.data || (yield CoBody(this, { limit: '50mb' }));
        this.body = yield updateOne(id, data);
    }),
);

export default app;
