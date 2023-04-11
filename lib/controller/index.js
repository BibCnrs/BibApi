'use strict';

import koa from 'koa';
import mount from 'koa-mount';

import admin from './admin';
import ebsco from './ebsco';
import ezticket from './ezticket';
import serve from 'koa-static';

const app = new koa();

app.use(mount('/medias', serve('./uploads')));
app.use(mount('/admin', admin));
app.use(mount('/ebsco', ebsco));
app.use(mount('/ezticket', ezticket));

export default app;
