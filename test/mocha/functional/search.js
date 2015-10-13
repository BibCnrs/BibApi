'use strict';

import sessionMockRoute from '../../mock/controller/session';
import mockSearch from '../../mock/controller/search';
import aidsResult from '../../mock/controller/aidsResult.json';

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

    it ('should return a response', function* () {
        const response = yield request.get('/search/aids');
        assert.isTrue(sessionCall);
        assert.isTrue(searchCall);
        assert.deepEqual(response, JSON.stringify(aidsResult.SearchResult.Data.Records));
    });

    afterEach(function () {
        apiServer.close();
    });
});
