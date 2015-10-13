'use strict';

import ebscoEdsSearch from '../../../lib/services/ebscoEdsSearch';
import mockSearch from '../../mock/controller/search';
import aidsResult from '../../mock/controller/aidsResult.json';

describe('ebscoEdsSearch', function () {

    let receivedTerm, receivedToken;
    beforeEach(function () {
        apiServer.router.post(`/edsapi/rest/Search`, function* (next) {
            receivedTerm = this.request.body.SearchCriteria.Queries[0].Term;
            receivedToken = this.request.header['x-sessiontoken'];
            yield next;
        }, mockSearch);
        apiServer.start();
    });

    it('should return result list for specific session', function* () {
        let result = yield ebscoEdsSearch('aids', 'token-for-profile-vie');
        assert.equal(receivedTerm, 'aids');
        assert.equal(receivedToken, 'token-for-profile-vie');
        assert.deepEqual(result, aidsResult);
    });

    afterEach(function () {
        apiServer.close();
    });
});
