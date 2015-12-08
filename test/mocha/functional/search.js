import mockSearch from '../../mock/controller/search';
import aidsResult from '../services/parsedAidsResult.json';
import { auth } from 'config';

describe('GET /api/api/search/:term', function () {
    let searchCall;

    beforeEach(function* () {
        searchCall = null;

        yield redis.setAsync(auth.username, 'token');

        apiServer.router.post(`/edsapi/rest/Search`, function* (next) {
            searchCall = {
                token: this.header['x-sessiontoken']
            };
            yield next;
        }, mockSearch);

        apiServer.start();
    });

    it('should return a parsed response', function* () {
        const response = yield request.get('/api/search/aids');
        assert.deepEqual(searchCall, { token: 'token' });
        assert.deepEqual(JSON.parse(response), aidsResult);
    });

    it('should return error 401 if no Authorization token provided', function* () {
        const error = yield request.get('/api/search/aids', null).catch((error) => error);
        assert.isNull(searchCall);
        assert.equal(error.statusCode, 401);
        assert.equal(error.message, '401 - No Authorization header found\n');
    });

    it('should return error 401 if wrong Authorization token provided', function* () {
        const error = yield request.get('/api/search/aids', 'wrongtoken').catch((error) => error);
        assert.isNull(searchCall);
        assert.equal(error.statusCode, 401);
        assert.equal(error.message, '401 - Invalid token\n');
    });

    afterEach(function () {
        apiServer.close();
    });
});
