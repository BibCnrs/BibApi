import koa from 'koa';
import koaRouter from 'koa-router';
import bodyParser from 'koa-bodyparser';

import http from 'http';
import config from 'config';

let server, app;

const start = function() {
    app = koa();
    app.use(bodyParser());
    app.use(this.router.routes());
    app.use(this.router.allowedMethods());
    server = http.createServer(app.callback()).listen(config.ebsco.port);
};

const close = function close() {
    server.close();
    this.router = koaRouter();
};

export default {
    router: koaRouter(),
    start,
    close,
};
