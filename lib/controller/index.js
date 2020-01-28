'use strict';

import koa from 'koa';
import mount from 'koa-mount';

import admin from './admin';
import ebsco from './ebsco';
import ezticket from './ezticket';
import oa from './oa';

const app = koa();

app.use(mount('/admin', admin));
app.use(mount('/ebsco', ebsco));
app.use(mount('/ezticket', ezticket));
app.use(mount('/oa', oa)); // for rewriting url

export default app;
