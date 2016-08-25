import jwt from 'koa-jwt';
import { auth } from 'config';

import InistAccount from '../../../lib/models/InistAccount';

describe('POST /ebsco/login', function () {
    let inistAccountVie, inistAccountShs, inistAccount;

    beforeEach(function* () {

        const inistAccountQueries = InistAccount(postgres);

        yield ['vie', 'shs']
        .map(name => fixtureLoader.createDomain({ name }));

        yield fixtureLoader.createInistAccount({ username: 'john', password: 'secret', domains: ['vie'] });
        inistAccountVie = yield inistAccountQueries.selectOneByUsername('john');
        yield fixtureLoader.createInistAccount({ username: 'jane', password: 'secret', domains: ['shs'] });
        inistAccountShs = yield inistAccountQueries.selectOneByUsername('jane');
        yield fixtureLoader.createInistAccount({ username: 'johnny', password: 'secret', domains: ['shs', 'vie'] });
        inistAccount = yield inistAccountQueries.selectOneByUsername('johnny');

        apiServer.start();
    });

    it('should return authorization token with session for vie if called with right password and profile vie', function* () {
        const response = yield request.post('/ebsco/login', {
            username: inistAccountVie.username,
            password: inistAccountVie.password
        }, true);

        const tokenData = {
            username: inistAccountVie.username,
            domains: inistAccountVie.all_domains,
            groups: inistAccountVie.all_groups
        };

        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign(tokenData, auth.cookieSecret)}; path=/; httponly`
        ]);
        assert.deepEqual(response.body, {
            username: inistAccountVie.username,
            token: jwt.sign(tokenData, auth.headerSecret),
            domains: inistAccountVie.all_domains
        });
    });

    it('should return authorization token with session for shs if called with right password and profile shs', function* () {
        const response = yield request.post('/ebsco/login', {
            username: inistAccountShs.username,
            password: inistAccountShs.password
        }, true);

        const tokenData = {
            username: inistAccountShs.username,
            domains: inistAccountShs.all_domains,
            groups: inistAccountShs.all_groups
        };

        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign(tokenData, auth.cookieSecret)}; path=/; httponly`
        ]);
        assert.deepEqual(response.body, {
            username: inistAccountShs.username,
            token: jwt.sign(tokenData, auth.headerSecret),
            domains: inistAccountShs.all_domains
        });
    });

    it('should return authorization token with session for shs and vie if called with right password and profile shs and vie', function* () {
        const response = yield request.post('/ebsco/login', {
            username: inistAccount.username,
            password: inistAccount.password
        });

        const tokenData = {
            username: inistAccount.username,
            domains: inistAccount.all_domains,
            groups: inistAccount.all_groups
        };

        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign(tokenData, auth.cookieSecret)}; path=/; httponly`
        ]);
        assert.deepEqual(response.body, {
            username: inistAccount.username,
            token: jwt.sign(tokenData, auth.headerSecret),
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

    afterEach(function* () {
        request.setToken();
        apiServer.close();
        yield fixtureLoader.clear();
    });
});
