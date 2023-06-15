'use strict';

import koa from 'koa';
import mount from 'koa-mount';
import { content_delivery } from 'config';

import admin from './admin';
import ebsco from './ebsco';
import ezticket from './ezticket';
import serve from 'koa-static';

const app = new koa();

if (content_delivery.internal_server) {
    app.use(mount('/medias', serve('./uploads')));
}
app.use(mount('/admin', admin));
app.use(mount('/ebsco', ebsco));
app.use(mount('/ezticket', ezticket));

export default app;
