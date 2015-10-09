'use strict';

describe('GET /search', function () {
    it ('should return a response', function* () {
        const response = yield request.get('/search');
        assert.equal(response, 'doing a search on EBSCO... SOON');
    });
});
