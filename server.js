'use strict';

var env = process.env.NODE_ENV || 'development';

import koa from 'koa';
import mount from 'koa-mount';
import cors from 'koa-cors';
import jwt from 'koa-jwt';
import logger from './lib/services/logger';
import qs from 'koa-qs';
import config from 'config';

import controller from './lib/controller';
import login from './lib/controller/login';

const app = koa();
qs(app);

app.use(cors({origin: '*', methods: ['GET'], headers: ['Content-Type', 'Authorization']}));

// server logs
app.use(function* logHttp(next) {
    this.httpLog = {
        method: this.request.method,
        remoteIP: this.request.ip,
        userAgent: this.request.headers['user-agent']
    };
    var authorization = this.get('authorization');
    if (authorization) {
        this.httpLog.authorization = authorization;
    }
    yield next;
    this.httpLog.status = this.status;
    logger.info(this.request.url, this.httpLog);
});

// error catching - override koa's undocumented error handler
app.use(function *(next) {
    try {
        yield next;
    } catch (error) {
        this.app.emit('error', error, this);

        if (this.headerSent || !this.writable) {
            error.headerSent = true;
            return;
        }
        this.status = error.status || 500;
        if (env === 'development') {
            // respond with the error details
            var message = {
                error: error.message,
                stack: error.stack,
                code: error.code
            };
            this.body = JSON.stringify(message);
            this.type = 'json';
        } else {
            // just send the error message
            this.body = error.message;
        }
        this.res.end(this.body);
    }
});

// log the error
app.on('error', function (err, ctx) {
    if (!ctx) return;
    ctx.httpLog.status = ctx.status;
    ctx.httpLog.error = err.message;
    ctx.httpLog.stack = err.stack;
    logger.error(ctx.request.url, ctx.httpLog);
});

app.use(mount('/api', login.routes()));
app.use(mount('/api', login.allowedMethods()));
app.use(jwt({ secret: config.auth.secret }));
app.use(mount('/api', controller.routes()));
app.use(mount('/api', controller.allowedMethods()));

export default app;
