import mockSearch from '../../mock/controller/search';
import aidsResult from '../services/parsedAidsResult.json';

describe('GET /search/:profile/:term', function () {
    let token, noVieToken, searchCall;

    before(function* () {
        yield fixtureLoader.createUser({ username: 'john', password: 'secret', domains: ['vie', 'shs'] });
        yield fixtureLoader.createUser({ username: 'jane', password: 'secret', domains: ['shs'] });

        yield redis.setAsync('vie', 'auth-token-for-vie');
        yield redis.setAsync('shs', 'auth-token-for-shs');
        yield redis.setAsync('john-vie', 'session-token-for-vie');
        yield redis.setAsync('john-shs', 'session-token-for-shs');

        token = (yield request.post('/login', {
            username: 'john',
            password: 'secret'
        }, null)).token;

        noVieToken = (yield request.post('/login', {
            username: 'jane',
            password: 'secret'
        }, null)).token;
    });

    beforeEach(function* () {
        searchCall = null;

        apiServer.router.post(`/edsapi/rest/Search`, function* (next) {
            searchCall = {
                authToken: this.header['x-authenticationtoken'],
                sessionToken: this.header['x-sessiontoken']
            };
            yield next;
        }, mockSearch);

        apiServer.start();
    });

    it('should return a parsed response for logged profile vie', function* () {
        const response = yield request.get('/search/vie/aids', token);
        assert.deepEqual(searchCall, {
            authToken: 'auth-token-for-vie',
            sessionToken: 'session-token-for-vie'
        });
        assert.deepEqual(JSON.parse(response), aidsResult);
    });

    it('should return a parsed response for logged profile shs', function* () {
        const response = yield request.get('/search/shs/aids', token);
        assert.deepEqual(searchCall, {
            authToken: 'auth-token-for-shs',
            sessionToken: 'session-token-for-shs'
        });
        assert.deepEqual(JSON.parse(response), aidsResult);
    });

    it('should return error 404 response has no result', function* () {
        const error = yield (request.get('/search/vie/nemo', token).catch(e => e));
        assert.deepEqual(searchCall, {
            authToken: 'auth-token-for-vie',
            sessionToken: 'session-token-for-vie'
        });
        assert.equal(error.message, `404 - No Result found`);
        assert.equal(error.statusCode, 404);
    });

    it('should return error 500 if asking for a profile that does not exists', function* () {
        const error = yield (request.get('/search/tech/aids', token).catch(e => e));
        assert.isNull(searchCall);
        assert.equal(error.message, `500 - profile tech does not exists`);
        assert.equal(error.statusCode, 500);
    });

    it('should return error 401 if asking for a profile for which the user has no access', function* () {
        const error = yield (request.get('/search/vie/aids', noVieToken).catch(e => e));
        assert.isNull(searchCall);
        assert.equal(error.message, `401 - You are not authorized to access profile vie`);
        assert.equal(error.statusCode, 401);
    });

    it('should return error 401 if no Authorization token provided', function* () {
        const error = yield request.get('/search/vie/aids', null).catch((error) => error);
        assert.isNull(searchCall);
        assert.equal(error.statusCode, 401);
        assert.equal(error.message, '401 - No Authorization header found\n');
    });

    it('should return error 401 if wrong Authorization token provided', function* () {
        const error = yield request.get('/search/vie/aids', 'wrongtoken').catch((error) => error);
        assert.isNull(searchCall);
        assert.equal(error.statusCode, 401);
        assert.equal(error.message, '401 - Invalid token\n');
    });

    afterEach(function () {
        apiServer.close();
    });

    after(function* () {
        redis.flushdb();
        yield fixtureLoader.clear();
    });
});
