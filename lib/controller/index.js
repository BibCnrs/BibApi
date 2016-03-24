'use strict';

import koa from 'koa';
import route from 'koa-route';
import mount from 'koa-mount';

import admin from './admin';
import { secure } from './secure';
import ebsco from './ebsco';
import ezticket from './ezticket';

const app = koa();

app.use(route.get('/secure', secure));
app.use(mount('/admin', admin));
app.use(mount('/ebsco', ebsco));
app.use(mount('/ezticket', ezticket));

export default app;
