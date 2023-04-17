import koa from 'koa';
import route from 'koa-route';
import bodyParser from 'koa-body';
import { renameSync, mkdirSync, unlinkSync, existsSync } from 'fs';
import { insertOne, selectOne } from '../../models/Media';
import prisma from '../../prisma/prisma';
import CoBody from 'co-body';
import { updateOne } from '../../models/ContentManagement';
import { filesLogger } from '../../services/logger';

const app = new koa();

app.use(
    bodyParser({
        formidable: { uploadDir: './uploads' },
        multipart: true,
        urlencoded: true,
    }),
);

function getFile(filePath, fileName) {
    return `uploads/${filePath}/${fileName}`;
}

function logError(message) {
    filesLogger.error(`${new Date().toLocaleDateString()} - ERROR: ${message}`);
}

function logInfo(message) {
    filesLogger.info(`${new Date().toLocaleDateString()} - INFO: ${message}`);
}

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
        const filePath = `${date.getUTCFullYear()}/${
            date.getUTCMonth() + 1
        }/${date.getUTCDate()}`;
        try {
            mkdirSync(`uploads/${filePath}`, {
                recursive: true,
            });
        } catch (e) {
            logError(
                `Can't create folders uploads/${filePath}! Stack trace: ${JSON.stringify(
                    e,
                )}`,
            );
            throw e;
        }

        let finalFileName = this.request.body.files.file.name;
        let index = 1;
        while (existsSync(getFile(filePath, finalFileName))) {
            const file = this.request.body.files.file.name.split('.');
            file[file.length - 2] = file[file.length - 2] + '-' + index;
            index++;
            finalFileName = file.join('.');
        }

        const data = {
            name: this.request.body.fields.name,
            file_name: finalFileName,
            file: getFile(filePath, finalFileName),
            url:
                process.env.BIBAPI_HOST +
                '/medias/' +
                filePath +
                '/' +
                finalFileName,
        };

        try {
            renameSync(this.request.body.files.file.path, data.file);
        } catch (e) {
            logError(
                `Can't move uploads file to ${
                    data.file
                }! Stack trace: ${JSON.stringify(e)}`,
            );
            throw e;
        }

        this.body = yield insertOne(data);

        logInfo(`File ${data.file} has been upload without any error`);
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
            try {
                unlinkSync(element.file);
            } catch (e) {
                logError(
                    `Can't delete file ${
                        element.file
                    }! Stack trace: ${JSON.stringify(e)}`,
                );
            }
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
