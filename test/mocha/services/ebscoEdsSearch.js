'use strict';

import ebscoEdsSearch from '../../../lib/services/ebscoEdsSearch';
import mockSearch from '../../mock/controller/search';
import aidsResult from '../../mock/controller/aidsResult.json';

describe('ebscoEdsSearch', function () {

    let receivedTerm, receivedLimiters, receivedToken, receivedCurrentPage;
    beforeEach(function () {
        apiServer.router.post(`/edsapi/rest/Search`, function* (next) {
            receivedCurrentPage = this.request.body.RetrievalCriteria.PageNumber;
            receivedTerm = this.request.body.SearchCriteria.Queries[0].Term;
            receivedLimiters = this.request.body.SearchCriteria.Limiters;
            receivedToken = this.request.header['x-sessiontoken'];
            yield next;
        }, mockSearch);
        apiServer.start();
    });

    it('should send term, token, and limiters', function* () {
        let result = yield ebscoEdsSearch('aids', { FT: 'y', DT1: '2015-01/2015-11', currentPage: 10 }, 'token-for-profile-vie');
        assert.equal(receivedTerm, 'aids');
        assert.equal(receivedCurrentPage, 10);
        assert.deepEqual(receivedLimiters, [
            { Id: 'FT', Values: ['y'] },
            { Id: 'DT1', Values: ['2015-01/2015-11'] }
        ]);
        assert.equal(receivedToken, 'token-for-profile-vie');
        assert.deepEqual(result, aidsResult);
    });

    it('should default currentPage to 1 and limiters to empty array if no query given', function* () {
        let result = yield ebscoEdsSearch('aids', undefined, 'token-for-profile-vie');
        assert.equal(receivedTerm, 'aids');
        assert.equal(receivedCurrentPage, 1);
        assert.deepEqual(receivedLimiters, []);
        assert.equal(receivedToken, 'token-for-profile-vie');
        assert.deepEqual(result, aidsResult);
    });

    it('should ignore limiters that are not allowed', function* () {
        let result = yield ebscoEdsSearch('aids', { FT: 'y', DT1: '2015-01/2015-11', disallowed: 'ignored'}, 'token-for-profile-vie');
        assert.deepEqual(receivedLimiters, [
            { Id: 'FT', Values: ['y'] },
            { Id: 'DT1', Values: ['2015-01/2015-11'] }
        ]);
        assert.deepEqual(result, aidsResult);
    });

    afterEach(function () {
        apiServer.close();
    });
});
