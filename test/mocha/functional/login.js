'use strict';

import jwt from 'koa-jwt';

import { auth } from 'config';
import sessionMockRoute from '../../mock/controller/session';

describe('POST /api/login', function () {
    let sessionCall;

    beforeEach(function () {
        sessionCall = false;

        apiServer.router.post('/edsapi/rest/CreateSession', function* (next) {
            sessionCall = true;
            yield next;
        }, sessionMockRoute);

        apiServer.start();
    });

    it('should return authorization token with session for vie if called with right password and profile vie', function* () {
        const response = yield request.post('/api/login', {
            username: auth.username,
            password: auth.password,
            profile: 'vie'
        }, null);
        assert.deepEqual(response, { token: jwt.sign({ username: auth.username }, auth.secret) });
        assert.isTrue(sessionCall);
        assert.equal(yield redis.getAsync(auth.username), 'token-for-profile-vie');
    });

    it('should return authorization token with session for shs if called with right password and profile shs', function* () {
        const response = yield request.post('/api/login', {
            username: auth.username,
            password: auth.password,
            profile: 'shs'
        }, null);
        assert.deepEqual(response, { token: jwt.sign({ username: auth.username }, auth.secret) });
        assert.isTrue(sessionCall);
        assert.equal(yield redis.getAsync(auth.username), 'token-for-profile-shs');
    });

    it('should return 401 with wrong password', function* () {
        const error = yield request.post('/api/login', {
            username: 'john',
            password: 'doe'
        }, null).catch((error) => error);
        assert.equal(error.statusCode, 401);
        assert.equal(error.message, '401 - Unauthorized');
        assert.isFalse(sessionCall);
        assert.isNull(yield redis.getAsync('john'));
    });

    afterEach(function () {
        apiServer.close();
    });
});
