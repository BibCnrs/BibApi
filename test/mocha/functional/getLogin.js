import jwt from 'koa-jwt';
import { auth } from 'config';

describe('POST /ebsco/getLogin', function() {
    it('should return username, domains from cookie_token and header_token saved in redis in cookie_token shib key and delete it from redis', function*() {
        yield redis.setAsync('shibboleth_session_cookie', 'header_token');

        const cookieToken = jwt.sign(
            {
                domains: ['vie', 'shs'],
                groups: ['insb', 'inshs'],
                shib: 'shibboleth_session_cookie',
                username: 'john',
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
            domains: ['vie', 'shs'],
            origin: 'inist',
            token: 'header_token',
            username: 'john',
        });

        assert.isNull(yield redis.getAsync('shibboleth_session_cookie'));
    });

    it('should return 401 if no token saved in redis', function*() {
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

    it('should return 401 if no cookie_token', function*() {
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

    afterEach(function() {
        request.setToken();
    });
});
