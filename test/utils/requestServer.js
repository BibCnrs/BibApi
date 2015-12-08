'use strict';

import request from 'request-promise';
import server from '../../server';
import jwt from 'koa-jwt';

var http = require('http');
var config = require('config');

var host = `http://${config.host}:${config.port}`;
var app = http.createServer(server.callback()).listen(config.port);

export const close = app.close.bind(app);

let globalToken = jwt.sign({username: config.auth.username}, config.auth.secret);

export const setToken = function setToken(payload, secret = config.auth.secret) {
    globalToken = jwt.sign(payload, secret);
};

export const get = function get(url, token = globalToken) {
    return request({
        method: 'GET',
        url: `${host}${url}`,
        headers: {
            Authorization: token ? `Bearer ${token}` : undefined
        }
    });
};

export const post = function post(url, json, token = globalToken) {
    return request({
        method: 'POST',
        url: `${host}${url}`,
        json,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : undefined
        }
    });
};
