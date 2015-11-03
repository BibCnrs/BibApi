'use strict';

import koa from 'koa';
import mount from 'koa-mount';
import cors from 'koa-cors';
import jwt from 'koa-jwt';
import controller from './lib/controller';
import login from './lib/controller/login';
import config from 'config';

const app = koa();

app.use(cors({origin: '*', methods: ['GET'], headers: ['Content-Type', 'Authorization']}));
app.use(mount('/api', login.routes()));
app.use(mount('/api', login.allowedMethods()));
app.use(jwt({ secret: config.auth.secret }));
app.use(mount('/api', controller.routes()));
app.use(mount('/api', controller.allowedMethods()));

export default app;
