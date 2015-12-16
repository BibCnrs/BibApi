import sessionMockRoute from '../../mock/controller/session';
import mockSearch from '../../mock/controller/search';
import aidsResult from '../services/parsedAidsResult.json';

describe('GET /api/api/search/:term', function () {
    let token, searchCall;

    before(function* () {
        yield fixtureLoader.createUser({ username: 'john', password: 'secret', domians: ['vie'] });

        yield redis.hsetAsync('john', 'vie', 'token-for-profile-vie');
        yield redis.hsetAsync('john', 'shs', 'token-for-profile-shs');

        token = (yield request.post('/api/login', {
            username: 'john',
            password: 'secret'
        }, null)).token;
    });

    beforeEach(function* () {
        searchCall = null;
        apiServer.router.post('/edsapi/rest/CreateSession', sessionMockRoute);

        apiServer.router.post(`/edsapi/rest/Search`, function* (next) {
            searchCall = {
                token: this.header['x-sessiontoken']
            };
            yield next;
        }, mockSearch);

        apiServer.start();
    });

    it('should return a parsed response for logged profile vie', function* () {
        const response = yield request.get('/api/search/vie/aids', token);
        assert.deepEqual(searchCall, { token: 'token-for-profile-vie' });
        assert.deepEqual(JSON.parse(response), aidsResult);
    });

    it('should return a parsed response for logged profile shs', function* () {
        const response = yield request.get('/api/search/shs/aids', token);
        assert.deepEqual(searchCall, { token: 'token-for-profile-shs' });
        assert.deepEqual(JSON.parse(response), aidsResult);
    });

    it('should return error 404 response has no result', function* () {
        const error = yield (request.get('/api/search/vie/nemo', token).catch(e => e));
        assert.deepEqual(searchCall, { token: 'token-for-profile-vie' });
        assert.equal(error.message, `404 - No Result found`);
        assert.equal(error.statusCode, 404);
    });

    it('should return error 401 if asking for a profile for which the user has no access', function* () {
        const error = yield (request.get('/api/search/tech/aids', token).catch(e => e));
        assert.isNull(searchCall);
        assert.equal(error.message, `401 - You are not authorized to access profile tech`);
        assert.equal(error.statusCode, 401);
    });

    it('should return error 401 if no Authorization token provided', function* () {
        const error = yield request.get('/api/search/vie/aids', null).catch((error) => error);
        assert.isNull(searchCall);
        assert.equal(error.statusCode, 401);
        assert.equal(error.message, '401 - No Authorization header found\n');
    });

    it('should return error 401 if wrong Authorization token provided', function* () {
        const error = yield request.get('/api/search/vie/aids', 'wrongtoken').catch((error) => error);
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
