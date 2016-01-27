'use strict';

import jwt from 'koa-jwt';

import { auth } from 'config';

describe('POST /login', function () {
    let userVie, userShs, user;

    beforeEach(function* () {

        userVie = yield fixtureLoader.createUser({ username: 'john', password: 'secret', domains: ['vie'] });
        userShs = yield fixtureLoader.createUser({ username: 'jane', password: 'secret', domains: ['shs'] });
        user = yield fixtureLoader.createUser({ username: 'johnny', password: 'secret', domains: ['vie', 'shs'] });

        apiServer.start();
    });

    it('should return authorization token with session for vie if called with right password and profile vie', function* () {
        const response = yield request.post('/login', {
            username: userVie.username,
            password: userVie.password
        }, null);
        assert.deepEqual(response, {
            token: jwt.sign({ username: userVie.username, domains: userVie.domains }, auth.secret),
            domains: userVie.domains
        });
    });

    it('should return authorization token with session for shs if called with right password and profile shs', function* () {
        const response = yield request.post('/login', {
            username: userShs.username,
            password: userShs.password
        }, null);
        assert.deepEqual(response, {
            token: jwt.sign({ username: userShs.username, domains: userShs.domains}, auth.secret),
            domains: userShs.domains
        });
    });

    it('should return authorization token with session for shs and vie if called with right password and profile shs and vie', function* () {
        const response = yield request.post('/login', {
            username: user.username,
            password: user.password
        }, null);
        assert.deepEqual(response, {
            token: jwt.sign({ username: user.username, domains: user.domains }, auth.secret),
            domains: ['vie', 'shs']
        });
    });

    it('should return 401 with wrong password', function* () {
        const error = yield request.post('/login', {
            username: 'john',
            password: 'doe'
        }, null).catch((error) => error);
        assert.equal(error.statusCode, 401);
        assert.equal(error.message, '401 - Unauthorized');
    });

    afterEach(function* () {
        apiServer.close();
        yield fixtureLoader.clear();
    });
});
