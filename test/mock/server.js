'use strict';

import koa from 'koa';
import bodyParser from 'koa-bodyparser';
import controller from './controller';
const app = koa();

app.use(bodyParser());

app.use(controller.routes());
app.use(controller.allowedMethods());

export default app;
