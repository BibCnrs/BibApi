import jwt from 'koa-jwt';
import { auth } from 'config';

describe('POST /ebsco/login', function () {
    let inistAccountVie, inistAccountShs, inistAccount;

    beforeEach(function* () {
        yield ['vie', 'shs']
        .map(name => fixtureLoader.createDomain({ name }));

        inistAccountVie = yield fixtureLoader.createInistAccount({ username: 'john', password: 'secret', domains: ['vie'] });
        inistAccountShs = yield fixtureLoader.createInistAccount({ username: 'jane', password: 'secret', domains: ['shs'] });
        inistAccount = yield fixtureLoader.createInistAccount({ username: 'johnny', password: 'secret', domains: ['shs', 'vie'] });

        apiServer.start();
    });

    it('should return authorization token with session for vie if called with right password and profile vie', function* () {
        const response = yield request.post('/ebsco/login', {
            username: inistAccountVie.username,
            password: inistAccountVie.password
        }, true);
        const domains = inistAccountVie.domains.map(d => d.name);
        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign({ username: inistAccountVie.username, domains }, auth.cookieSecret)}; path=/; httponly`
        ]);
        assert.deepEqual(response.body, {
            username: inistAccountVie.username,
            token: jwt.sign({ username: inistAccountVie.username, domains }, auth.headerSecret),
            domains: domains
        });
    });

    it('should return authorization token with session for shs if called with right password and profile shs', function* () {
        const response = yield request.post('/ebsco/login', {
            username: inistAccountShs.username,
            password: inistAccountShs.password
        }, true);
        const domains = inistAccountShs.domains.map(d => d.name);
        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign({ username: inistAccountShs.username, domains }, auth.cookieSecret)}; path=/; httponly`
        ]);
        assert.deepEqual(response.body, {
            username: inistAccountShs.username,
            token: jwt.sign({ username: inistAccountShs.username, domains }, auth.headerSecret),
            domains
        });
    });

    it('should return authorization token with session for shs and vie if called with right password and profile shs and vie', function* () {
        const response = yield request.post('/ebsco/login', {
            username: inistAccount.username,
            password: inistAccount.password
        });
        const domains = inistAccount.domains.map(d => d.name);
        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign({ username: inistAccount.username, domains }, auth.cookieSecret)}; path=/; httponly`
        ]);
        assert.deepEqual(response.body, {
            username: inistAccount.username,
            token: jwt.sign({ username: inistAccount.username, domains }, auth.headerSecret),
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
