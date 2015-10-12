'use strict';

describe('GET /search', function () {
    it ('should return a response', function* () {
        const response = yield request.get('/search');
        assert.deepEqual(response, `{"SessionToken":"token-for-profile-vie"}`);
    });
});
