import jwt from 'koa-jwt';
import { auth } from 'config';

import InistAccount from '../../../lib/models/InistAccount';

describe('POST /ebsco/login', function () {
    let inistAccountVie, inistAccountShs, inistAccount;

    beforeEach(function* () {

        const inistAccountQueries = InistAccount(postgres);

        const [vie, shs] = yield ['vie', 'shs']
        .map(name => fixtureLoader.createCommunity({ name }));

        yield fixtureLoader.createInistAccount({ username: 'john', password: 'secret', communities: [vie.id] });
        inistAccountVie = yield inistAccountQueries.selectOneByUsername('john');
        yield fixtureLoader.createInistAccount({ username: 'jane', password: 'secret', communities: [shs.id] });
        inistAccountShs = yield inistAccountQueries.selectOneByUsername('jane');
        yield fixtureLoader.createInistAccount({ username: 'johnny', password: 'secret', communities: [shs.id, vie.id] });
        inistAccount = yield inistAccountQueries.selectOneByUsername('johnny');

        apiServer.start();
    });

    it('should return authorization token with session for vie if called with right password and profile vie', function* () {
        const response = yield request.post('/ebsco/login', {
            username: inistAccountVie.username,
            password: inistAccountVie.password
        }, true);

        const tokenData = {
            id: inistAccountVie.id,
            username: inistAccountVie.username,
            domains: inistAccountVie.domains,
            groups: inistAccountVie.groups,
            origin: 'inist'
        };

        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign(tokenData, auth.cookieSecret)}; path=/; httponly`
        ]);
        assert.deepEqual(response.body, {
            username: inistAccountVie.username,
            token: jwt.sign(tokenData, auth.headerSecret),
            domains: inistAccountVie.domains
        });
    });

    it('should return authorization token with session for shs if called with right password and profile shs', function* () {
        const response = yield request.post('/ebsco/login', {
            username: inistAccountShs.username,
            password: inistAccountShs.password
        }, true);

        const tokenData = {
            id: inistAccountShs.id,
            username: inistAccountShs.username,
            domains: inistAccountShs.domains,
            groups: inistAccountShs.groups,
            origin: 'inist'
        };

        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign(tokenData, auth.cookieSecret)}; path=/; httponly`
        ]);
        assert.deepEqual(response.body, {
            username: inistAccountShs.username,
            token: jwt.sign(tokenData, auth.headerSecret),
            domains: inistAccountShs.domains
        });
    });

    it('should return authorization token with session for shs and vie if called with right password and profile shs and vie', function* () {
        const response = yield request.post('/ebsco/login', {
            username: inistAccount.username,
            password: inistAccount.password
        });

        const tokenData = {
            id: inistAccount.id,
            username: inistAccount.username,
            domains: inistAccount.domains,
            groups: inistAccount.groups,
            origin: 'inist'
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
