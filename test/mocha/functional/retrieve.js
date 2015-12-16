import sessionMockRoute from '../../mock/controller/session';
import mockRetrieve from '../../mock/controller/retrieve';
import retrieveParser from '../../../lib/services/retrieveParser';

import { SearchResult } from '../../mock/controller/aidsResult.json';
const aidsResult = SearchResult.Data.Records;

describe('GET /api/retrieve/:term/:dbId/:an', function () {
    let token, retrieveCall;

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
        retrieveCall = null;
        apiServer.router.post('/edsapi/rest/CreateSession', sessionMockRoute);

        apiServer.router.post(`/edsapi/rest/Retrieve`, function* (next) {
            retrieveCall = {
                token: this.header['x-sessiontoken']
            };
            yield next;
        }, mockRetrieve);

        apiServer.start();
    });

    it('should return a parsed response for logged profile vie', function* () {
        const response = yield request.get(`/api/retrieve/vie/${aidsResult[0].Header.DbId}/${aidsResult[0].Header.An}`, token);
        assert.deepEqual(retrieveCall, { token: 'token-for-profile-vie' });
        assert.deepEqual(JSON.parse(response), retrieveParser(aidsResult[0]));
    });

    it('should return a parsed response for logged profile shs', function* () {
        const response = yield request.get(`/api/retrieve/shs/${aidsResult[1].Header.DbId}/${aidsResult[1].Header.An}`, token);
        assert.deepEqual(retrieveCall, { token: 'token-for-profile-shs' });
        assert.deepEqual(JSON.parse(response), retrieveParser(aidsResult[1]));
    });

    it('should return error 401 if asking for a profile for which the user has no access', function* () {
        const error = yield (request.get(`/api/retrieve/tech/${aidsResult[1].Header.DbId}/${aidsResult[1].Header.An}`, token).catch(e => e));
        assert.isNull(retrieveCall);
        assert.equal(error.message, `401 - You are not authorized to access profile tech`);
        assert.equal(error.statusCode, 401);
    });

    it('should return error 401 if no Authorization token provided', function* () {
        const error = yield request.get(`/api/retrieve/shs/${aidsResult[1].Header.DbId}/${aidsResult[1].Header.An}`, null).catch((error) => error);
        assert.isNull(retrieveCall);
        assert.equal(error.statusCode, 401);
        assert.equal(error.message, '401 - No Authorization header found\n');
    });

    it('should return error 401 if wrong Authorization token provided', function* () {
        const error = yield request.get(`/api/retrieve/shs/${aidsResult[1].Header.DbId}/${aidsResult[1].Header.An}`, 'wrongtoken').catch((error) => error);
        assert.isNull(retrieveCall);
        assert.equal(error.statusCode, 401);
        assert.equal(error.message, '401 - Invalid token\n');
    });

    it('should return error 404 no result with wanted dbId, An', function* () {
        const error = yield request.get(`/api/retrieve/shs/wrongDbId/wrongAn`, token).catch((error) => error);
        assert.deepEqual(retrieveCall, { token: 'token-for-profile-shs' });
        assert.equal(error.statusCode, 404);
        assert.equal(error.message, '404 - Not Found');
    });

    afterEach(function () {
        apiServer.close();
    });

    after(function* () {
        redis.flushdb();
        yield fixtureLoader.clear();
    });
});
