'use strict';

import koa from 'koa';
import mount from 'koa-mount';

import admin from './admin';
import ebsco from './ebsco';
import ezticket from './ezticket';

const app = new koa();

app.use(mount('/admin', admin));
app.use(mount('/ebsco', ebsco));
app.use(mount('/ezticket', ezticket));

export default app;
