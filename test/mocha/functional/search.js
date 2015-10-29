'use strict';

import sessionMockRoute from '../../mock/controller/session';
import mockSearch from '../../mock/controller/search';
import aidsResult from '../services/parsedAidsResult.json';

describe('GET /search/:term', function () {
    let sessionCall, searchCall;

    beforeEach(function () {
        sessionCall = false;
        searchCall = false;

        apiServer.router.post('/edsapi/rest/CreateSession', function* (next) {
            sessionCall = true;
            yield next;
        }, sessionMockRoute);

        apiServer.router.post(`/edsapi/rest/Search`, function* (next) {
            searchCall = true;
            yield next;
        }, mockSearch);

        apiServer.start();
    });

    it('should return a parsed response', function* () {
        const response = yield request.get('/search/aids');
        assert.isTrue(sessionCall);
        assert.isTrue(searchCall);
        assert.deepEqual(JSON.parse(response), aidsResult);
    });

    it('should return error 401 if no Authorization token provided', function* () {
        const error = yield request.get('/search/aids', null).catch((error) => error);
        assert.isFalse(sessionCall);
        assert.isFalse(searchCall);
        assert.equal(error.statusCode, 401);
        assert.equal(error.message, '401 - No Authorization header found\n');
    });

    it('should return error 401 if wrong Authorization token provided', function* () {
        const error = yield request.get('/search/aids', 'wrongtoken').catch((error) => error);
        assert.isFalse(sessionCall);
        assert.isFalse(searchCall);
        assert.equal(error.statusCode, 401);
        assert.equal(error.message, '401 - Invalid token\n');
    });

    afterEach(function () {
        apiServer.close();
    });
});
