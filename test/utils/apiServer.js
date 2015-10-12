'use strict';

import server from '../mock/server';

import http from 'http';
import config from 'config';

const app = http.createServer(server.callback()).listen(config.ebsco.port);

const defaultRoute = server.middleware.slice();

export const reset = function reset() {
    app.middleware = defaultRoute;
};

export const close = app.close.bind(app);
