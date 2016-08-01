/**
Initialize koa application in server.js and allow to send request to it.
*/
import request from 'request-promise';
import server from '../../server';
import jwt from 'koa-jwt';

var http = require('http');
var config = require('config');

var host = `http://${config.host}:${config.port}`;
var app = http.createServer(server.callback()).listen(config.port);

export const close = app.close.bind(app);

let globalHeaderToken;
let globalCookieToken;

// generate cookie and header tokens
export const setToken = function setToken(payload = {}, headerSecret = config.auth.headerSecret, cookieSecret = config.auth.cookieSecret) {
    globalHeaderToken = jwt.sign(payload, headerSecret);
    globalCookieToken = jwt.sign(payload, cookieSecret);
};

// send a get request to bibapi
export const get = function get(url, headers = {}, headerToken = globalHeaderToken, cookieToken = globalCookieToken) {
    const jar = request.jar();
    const cookie = request.cookie(`bibapi_token=${cookieToken}`);
    jar.setCookie(cookie, host);

    return request({
        method: 'GET',
        url: `${host}${url}`,
        jar,
        followRedirect: false,
        resolveWithFullResponse: true,
        headers: {
            ...headers,
            Authorization: headerToken ? `Bearer ${headerToken}` : undefined
        }
    }).catch(e => e.response);
};

export const post = function post(url, json, headerToken = globalHeaderToken, cookieToken = globalCookieToken) {
    const jar = request.jar();
    const cookie = request.cookie(`bibapi_token=${cookieToken}`);
    jar.setCookie(cookie, host);

    return request({
        method: 'POST',
        url: `${host}${url}`,
        jar,
        json,
        followRedirect: false,
        resolveWithFullResponse: true,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: headerToken ? `Bearer ${headerToken}` : undefined
        }
    }).catch(e => e.response);
};
