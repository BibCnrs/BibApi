import koa from 'koa';
import route from 'koa-route';
import bodyParser from 'koa-body';
import { renameSync, mkdirSync } from 'fs';

const app = new koa();

app.use(
    bodyParser({
        formidable: { uploadDir: './uploads' },
        multipart: true,
        urlencoded: true,
    }),
);

app.use(
    route.post('/', function* () {
        // eslint-disable-next-line no-console
        console.log(this.request.body.fields);
        const date = new Date();
        const filePath = `uploads/${date.getUTCFullYear()}/${
            date.getUTCMonth() + 1
        }/${date.getUTCDate()}`;
        try {
            mkdirSync(filePath, {
                recursive: true,
            });
        } catch (e) {
            // It not a bug, it a feature.
        }

        renameSync(
            this.request.body.files.test.path,
            filePath + '/' + this.request.body.files.test.name,
        );

        // TODO Ajouté le lien dans la bdd

        this.body = 'all good';
    }),
);

export default app;
