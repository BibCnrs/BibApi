'use strict';

import koa from 'koa';
import cors from 'koa-cors';
import jwt from 'koa-jwt';
import controller from './lib/controller';
import login from './lib/controller/login';
import config from 'config';

const app = koa();

app.use(cors({origin: '*', methods: ['GET'], headers: ['Content-Type', 'Authorization']}));
app.use(login.routes());
app.use(login.allowedMethods());
app.use(jwt({ secret: config.auth.secret }));
app.use(controller.routes());
app.use(controller.allowedMethods());

export default app;
