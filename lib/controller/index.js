'use strict';

import koa from 'koa';
import route from 'koa-route';
import mount from 'koa-mount';

import { login } from './login';
import admin from './admin';
import { secure } from './secure';
import ebsco from './ebsco';

const app = koa();

app.use(route.get('/secure', secure));
app.use(mount('/admin', admin));
app.use(route.post('/login', login));
app.use(mount('/ebsco', ebsco));

export default app;
