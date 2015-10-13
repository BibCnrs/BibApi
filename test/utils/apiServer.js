'use strict';
import koa from 'koa';
import koaRouter from 'koa-router';
import bodyParser from 'koa-bodyparser';

import http from 'http';
import config from 'config';

const app = koa();
app.use(bodyParser());

let server;

const defaultRoute = app.middleware.slice();

app.router = koaRouter();

app.reset = function reset() {
    this.middleware = defaultRoute;
    this.router = koaRouter();
};

app.start = function () {
    app.use(this.router.routes());
    app.use(this.router.allowedMethods());
    server = http.createServer(app.callback()).listen(config.ebsco.port);
};

app.close = function () {
    server.close();
};

export default app;
