'use strict';

var env = process.env.NODE_ENV || 'development';

import mongooseConnection from './lib/utils/mongooseConnection';
import koa from 'koa';
import mount from 'koa-mount';
import cors from 'koa-cors';
import logger from './lib/services/logger';
import qs from 'koa-qs';

import controller from './lib/controller';
import getRedisClient from './lib/utils/getRedisClient';

const app = koa();
qs(app);

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], headers: ['Content-Type', 'Authorization', 'shib'] }));

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

app.use(function* (next) {
    this.redis = getRedisClient();
    yield this.redis.selectAsync(env === 'test' ? 2 : 1);

    yield next;
    this.redis.quit();
});

// error catching - override koa's undocumented error handler
app.use(function *(next) {
    try {
        yield next;
    } catch (error) {
        logger.error(JSON.stringify(error));
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

// mongoose connection
mongooseConnection.on('error', (err) => {
    app.emit('error', err);
});

app.use(mount('/', controller));

export default app;
