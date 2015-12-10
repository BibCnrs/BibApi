'use strict';

import jwt from 'koa-jwt';

import { auth } from 'config';
import sessionMockRoute from '../../mock/controller/session';

describe('POST /api/login', function () {
    let userVie, userShs, user, sessionCall;

    beforeEach(function* () {
        sessionCall = 0;

        userVie = yield fixtureLoader.createUser({ username: 'john', password: 'secret', domains: ['vie'] });
        userShs = yield fixtureLoader.createUser({ username: 'jane', password: 'secret', domains: ['shs'] });
        user = yield fixtureLoader.createUser({ username: 'johnny', password: 'secret', domains: ['vie', 'shs'] });
        apiServer.router.post('/edsapi/rest/CreateSession', function* (next) {
            sessionCall++;
            yield next;
        }, sessionMockRoute);

        apiServer.start();
    });

    it('should return authorization token with session for vie if called with right password and profile vie', function* () {
        const response = yield request.post('/api/login', {
            username: userVie.username,
            password: userVie.password
        }, null);
        assert.deepEqual(response, { token: jwt.sign({ username: userVie.username, domains: userVie.domains }, auth.secret) });
        assert.equal(sessionCall, 1);
        assert.equal(yield redis.hgetAsync(userVie.username, 'vie'), 'token-for-profile-vie');
        assert.isNull(yield redis.hgetAsync(userVie.username, 'shs'));
    });

    it('should return authorization token with session for shs if called with right password and profile shs', function* () {
        const response = yield request.post('/api/login', {
            username: userShs.username,
            password: userShs.password
        }, null);
        assert.deepEqual(response, { token: jwt.sign({ username: userShs.username, domains: userShs.domains }, auth.secret) });
        assert.equal(sessionCall, 1);
        assert.isNull(yield redis.hgetAsync(userShs.username, 'vie'));
        assert.equal(yield redis.hgetAsync(userShs.username, 'shs'), 'token-for-profile-shs');
    });

    it('should return authorization token with session for shs and vie if called with right password and profile shs and vie', function* () {
        const response = yield request.post('/api/login', {
            username: user.username,
            password: user.password
        }, null);
        assert.deepEqual(response, { token: jwt.sign({ username: user.username, domains: user.domains }, auth.secret) });
        assert.equal(sessionCall, 2);
        assert.equal(yield redis.hgetAsync(user.username, 'vie'), 'token-for-profile-vie');
        assert.equal(yield redis.hgetAsync(user.username, 'shs'), 'token-for-profile-shs');
    });

    it('should return 401 with wrong password', function* () {
        const error = yield request.post('/api/login', {
            username: 'john',
            password: 'doe'
        }, null).catch((error) => error);
        assert.equal(error.statusCode, 401);
        assert.equal(error.message, '401 - Unauthorized');
        assert.equal(sessionCall, 0);
        assert.isNull(yield redis.getAsync('john'));
    });

    afterEach(function* () {
        apiServer.close();
        redis.flushdb();
        yield fixtureLoader.clear();
    });
});
