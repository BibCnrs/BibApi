'use strict';

import koa from 'koa';
import cors from 'koa-cors';
import controller from './lib/controller';
const app = koa();

app.use(cors({origin: '*', methods: ['GET'], headers: ['Content-Type']}));
app.use(controller.routes());
app.use(controller.allowedMethods());

export default app;
