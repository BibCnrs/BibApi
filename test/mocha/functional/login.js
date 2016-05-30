import jwt from 'koa-jwt';

import { auth } from 'config';

describe('POST /ebsco/login', function () {
    let userVie, userShs, user, userRenater;

    beforeEach(function* () {
        yield ['vie', 'shs']
        .map(name => fixtureLoader.createDomain({ name }));

        userVie = yield fixtureLoader.createUser({ username: 'john', password: 'secret', domains: ['vie'] });
        userShs = yield fixtureLoader.createUser({ username: 'jane', password: 'secret', domains: ['shs'] });
        user = yield fixtureLoader.createUser({ username: 'johnny', password: 'secret', domains: ['shs', 'vie'] });
        userRenater = yield fixtureLoader.createUser({ username: 'renater', domains: ['shs', 'vie'] });

        apiServer.start();
    });

    it('should return authorization token with session for vie if called with right password and profile vie', function* () {
        const response = yield request.post('/ebsco/login', {
            username: userVie.username,
            password: userVie.password
        }, true);
        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign({ username: userVie.username, domains: userVie.domains }, auth.cookieSecret)}; path=/; httponly`
        ]);
        assert.deepEqual(response.body, {
            username: userVie.username,
            token: jwt.sign({ username: userVie.username, domains: userVie.domains }, auth.headerSecret),
            domains: userVie.domains
        });
    });

    it('should return authorization token with session for shs if called with right password and profile shs', function* () {
        const response = yield request.post('/ebsco/login', {
            username: userShs.username,
            password: userShs.password
        }, true);
        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign({ username: userShs.username, domains: userShs.domains }, auth.cookieSecret)}; path=/; httponly`
        ]);
        assert.deepEqual(response.body, {
            username: userShs.username,
            token: jwt.sign({ username: userShs.username, domains: userShs.domains}, auth.headerSecret),
            domains: userShs.domains
        });
    });

    it('should return authorization token with session for shs and vie if called with right password and profile shs and vie', function* () {
        const response = yield request.post('/ebsco/login', {
            username: user.username,
            password: user.password
        });
        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign({ username: user.username, domains: user.domains }, auth.cookieSecret)}; path=/; httponly`
        ]);
        assert.deepEqual(response.body, {
            username: user.username,
            token: jwt.sign({ username: user.username, domains: user.domains }, auth.headerSecret),
            domains: ['shs', 'vie']
        });
    });

    it('should return 401 with wrong password', function* () {
        const response = yield request.post('/ebsco/login', {
            username: 'john',
            password: 'doe'
        });
        assert.equal(response.statusCode, 401);
        assert.equal(response.body, 'Unauthorized');
    });

    it('should return 401 if user has no password (renater)', function* () {
        const response = yield request.post('/ebsco/login', {
            username: userRenater.username,
            password: ''
        });
        assert.equal(response.statusCode, 401);
        assert.equal(response.body, 'Unauthorized');
    });

    afterEach(function* () {
        request.setToken();
        apiServer.close();
        yield fixtureLoader.clear();
    });
});
