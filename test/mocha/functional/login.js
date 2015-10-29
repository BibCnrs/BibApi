'use strict';

import jwt from 'koa-jwt';
import { auth } from 'config';

describe('POST /login', function () {

    it('should return authorization token if called with right password', function* () {
        const response = yield request.post('/login', {
            username: auth.username,
            password: auth.password
        }, null);
        assert.deepEqual(response, { token: jwt.sign(auth.payload, auth.secret) });
    });

    it('should return 401 with wrong password', function* () {
        const error = yield request.post('/login', {
            username: 'john',
            password: 'doe'
        }, null).catch((error) => error);
        assert.equal(error.statusCode, 401);
        assert.equal(error.message, '401 - Unauthorized');
    });
});
