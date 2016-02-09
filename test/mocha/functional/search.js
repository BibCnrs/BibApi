import mockSearch from '../../mock/controller/search';
import aidsResult from '../services/parsedAidsResult.json';

describe('GET /ebsco/:domainName/search/:term', function () {
    let token, noVieToken, searchCall;

    before(function* () {
        yield fixtureLoader.createUser({ username: 'john', password: 'secret', domains: ['vie', 'shs'] });
        yield fixtureLoader.createUser({ username: 'jane', password: 'secret', domains: ['shs'] });

        yield fixtureLoader.createDomain({ name: 'vie', userId: 'userIdVie', password: 'passwordVie', profile: 'profileVie' });
        yield fixtureLoader.createDomain({ name: 'shs', userId: 'userIdShs', password: 'passwordShs', profile: 'profileShs' });

        yield redis.setAsync('vie', 'auth-token-for-vie');
        yield redis.setAsync('shs', 'auth-token-for-shs');
        yield redis.setAsync('john-vie', 'session-token-for-vie');
        yield redis.setAsync('john-shs', 'session-token-for-shs');

        token = (yield request.post('/ebsco/login', {
            username: 'john',
            password: 'secret'
        }, null)).token;

        noVieToken = (yield request.post('/ebsco/login', {
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
        const response = yield request.get('/ebsco/vie/search?term=aids', token);
        assert.deepEqual(searchCall, {
            authToken: 'auth-token-for-vie',
            sessionToken: 'session-token-for-vie'
        });
        assert.deepEqual(JSON.parse(response), aidsResult);
    });

    it('should return a parsed response for logged profile shs', function* () {
        const response = yield request.get('/ebsco/shs/search?term=aids', token);
        assert.deepEqual(searchCall, {
            authToken: 'auth-token-for-shs',
            sessionToken: 'session-token-for-shs'
        });
        assert.deepEqual(JSON.parse(response), aidsResult);
    });

    it('should return simple empty response when no result', function* () {
        const response = yield request.get('/ebsco/vie/search?term=nemo', token);
        assert.deepEqual(searchCall, {
            authToken: 'auth-token-for-vie',
            sessionToken: 'session-token-for-vie'
        });
        assert.deepEqual(JSON.parse(response), {
            totalHits: 0,
            results: [],
            facets: [],
            activeFacets: [],
            currentPage: 1,
            maxPage: 1
        });
    });

    it('should return error 500 if asking for a profile that does not exists', function* () {
        const error = yield (request.get('/ebsco/tech/search?term=aids', token).catch(e => e));
        assert.isNull(searchCall);
        assert.equal(error.message, `500 - Domain tech does not exists`);
        assert.equal(error.statusCode, 500);
    });

    it('should return error 401 if asking for a profile for which the user has no access', function* () {
        const error = yield (request.get('/ebsco/vie/search?term=aids', noVieToken).catch(e => e));
        assert.isNull(searchCall);
        assert.equal(error.message, `401 - You are not authorized to access domain vie`);
        assert.equal(error.statusCode, 401);
    });

    it('should return error 401 if no Authorization token provided', function* () {
        const error = yield request.get('/ebsco/vie/search?term=aids', null).catch((error) => error);
        assert.isNull(searchCall);
        assert.equal(error.statusCode, 401);
        assert.equal(error.message, '401 - No Authorization header found\n');
    });

    it('should return error 401 if wrong Authorization token provided', function* () {
        const error = yield request.get('/ebsco/vie/search?term=aids', 'wrongtoken').catch((error) => error);
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
