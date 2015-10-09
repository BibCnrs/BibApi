'use strict';

import koa from 'koa';
import controller from './lib/controller';
const app = koa();

app.use(controller.routes());
app.use(controller.allowedMethods());

export default app;
