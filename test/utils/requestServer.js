'use strict';

import request from 'request-promise';
import server from '../../server';

var http = require('http');
var config = require('config');

var host = `http://${config.host}:${config.port}`;
var app = http.createServer(server.callback()).listen(config.port);

export const close = app.close.bind(app);

export const get = function* (url) {
    console.log(`${host}${url}`);
    return yield request.get(`${host}${url}`);
};
