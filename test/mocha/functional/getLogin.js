import jwt from 'koa-jwt';
import { auth } from 'config';

describe('POST /ebsco/getLogin', function () {
    it('should return username, domains from cookie_token and header_token saved in redis in cookie_token shib key and delete it from redis', function* () {
        const insb = yield fixtureLoader.createCommunity({
            name: 'insb',
            gate: 'insb',
        });

        const inshs = yield fixtureLoader.createCommunity({
            name: 'inshs',
            gate: 'inshs',
        });

        const account = yield fixtureLoader.createJanusAccount({
            uid: 'john',
            communities: [insb.id, inshs.id],
        });

        yield redis.setAsync('shibboleth_session_cookie', 'header_token');

        const cookieToken = jwt.sign(
            {
                domains: ['insb', 'inshs'],
                groups: ['insb', 'inshs'],
                shib: 'shibboleth_session_cookie',
                username: 'john',
                id: account.id,
            },
            auth.cookieSecret,
        );

        const response = yield request.post(
            '/ebsco/getLogin',
            null,
            null,
            cookieToken,
        );
        assert.deepEqual(JSON.parse(response.body), {
            domains: ['insb', 'inshs'],
            favouriteResources: [],
            origin: 'inist',
            token: 'header_token',
            username: 'john',
            id: account.id,
        });

        assert.isNull(yield redis.getAsync('shibboleth_session_cookie'));
    });

    it('should return favourite_resources from account', function* () {
        const insb = yield fixtureLoader.createCommunity({
            name: 'insb',
            gate: 'insb',
        });

        const inshs = yield fixtureLoader.createCommunity({
            name: 'inshs',
            gate: 'inshs',
        });

        const account = yield fixtureLoader.createJanusAccount({
            uid: 'john',
            communities: [insb.id, inshs.id],
            favourite_resources: `[{ "title": "my resource", "url": "www.myresource.com" }]`,
        });

        yield fixtureLoader.createRevue({
            title: 'insb',
            url: 'www.insb.fr',
            communities: [insb.id],
        });
        yield fixtureLoader.createRevue({
            title: 'inshs',
            url: 'www.inshs.fr',
            communities: [inshs.id],
        });
        yield redis.setAsync('shibboleth_session_cookie', 'header_token');

        const cookieToken = jwt.sign(
            {
                domains: ['insb', 'inshs'],
                groups: ['insb', 'inshs'],
                shib: 'shibboleth_session_cookie',
                username: 'john',
                id: account.id,
            },
            auth.cookieSecret,
        );

        const response = yield request.post(
            '/ebsco/getLogin',
            null,
            null,
            cookieToken,
        );

        const body = JSON.parse(response.body);
        body.favouriteResources = JSON.parse(body.favouriteResources);

        assert.deepEqual(body, {
            domains: ['insb', 'inshs'],
            favouriteResources: [
                {
                    title: 'my resource',
                    url: 'www.myresource.com',
                },
            ],
            origin: 'inist',
            token: 'header_token',
            username: 'john',
            id: account.id,
        });
    });

    it('should return favourite_resources from revues if account has none', function* () {
        const insb = yield fixtureLoader.createCommunity({
            name: 'insb',
            gate: 'insb',
        });

        const inshs = yield fixtureLoader.createCommunity({
            name: 'inshs',
            gate: 'inshs',
        });

        const account = yield fixtureLoader.createJanusAccount({
            uid: 'john',
            communities: [insb.id, inshs.id],
        });

        yield fixtureLoader.createRevue({
            title: 'insb',
            url: 'www.insb.fr',
            communities: [insb.id],
        });
        yield fixtureLoader.createRevue({
            title: 'inshs',
            url: 'www.inshs.fr',
            communities: [inshs.id],
        });
        yield redis.setAsync('shibboleth_session_cookie', 'header_token');

        const cookieToken = jwt.sign(
            {
                domains: ['insb', 'inshs'],
                groups: ['insb', 'inshs'],
                shib: 'shibboleth_session_cookie',
                username: 'john',
                id: account.id,
            },
            auth.cookieSecret,
        );

        const response = yield request.post(
            '/ebsco/getLogin',
            null,
            null,
            cookieToken,
        );

        assert.deepEqual(JSON.parse(response.body), {
            domains: ['insb', 'inshs'],
            favouriteResources: [
                {
                    title: 'insb',
                    url: 'http://insb.bib.cnrs.fr/login?url=www.insb.fr',
                },
                {
                    title: 'inshs',
                    url: 'http://inshs.bib.cnrs.fr/login?url=www.inshs.fr',
                },
            ],
            origin: 'inist',
            token: 'header_token',
            username: 'john',
            id: account.id,
        });
    });

    it('should return 401 if no token saved in redis', function* () {
        const cookieToken = jwt.sign(
            {
                username: 'john',
                domains: ['vie', 'shs'],
                groups: ['insb', 'inshs'],
                shib: 'shibboleth_session_cookie',
            },
            auth.cookieSecret,
        );

        const response = yield request.post(
            '/ebsco/getLogin',
            null,
            null,
            cookieToken,
        );
        assert.equal(response.statusCode, 401);
        assert.equal(response.body, 'Unauthorized');
    });

    it('should return 401 if no cookie_token', function* () {
        yield redis.setAsync('shibboleth_session_cookie', 'header_token');

        const response = yield request.post(
            '/ebsco/getLogin',
            null,
            null,
            null,
        );
        assert.equal(response.statusCode, 401);
        assert.equal(response.body, 'Invalid token\n');
    });

    afterEach(function* () {
        request.setToken();
        yield fixtureLoader.clear();
    });
});
