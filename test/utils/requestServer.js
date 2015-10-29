'use strict';

import request from 'request-promise';
import server from '../../server';
import jwt from 'koa-jwt';

var http = require('http');
var config = require('config');

var host = `http://${config.host}:${config.port}`;
var app = http.createServer(server.callback()).listen(config.port);

export const close = app.close.bind(app);

const goodToken = jwt.sign(config.auth.payload, config.auth.secret);

export const get = function get(url, token = goodToken) {
    return request({
        method: 'GET',
        url: `${host}${url}`,
        headers: {
            Authorization: token ? `Bearer ${token}` : undefined
        }
    });
};

export const post = function post(url, json, token = goodToken) {
    return request({
        method: 'POST',
        url: `${host}${url}`,
        json,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Token: token ? `Bearer ${token}` : undefined
        }
    });
};
