'use strict';

import ebscoEdsSearch from '../../../lib/services/ebscoEdsSearch';
import mockSearch from '../../mock/controller/search';
import aidsResult from '../../mock/controller/aidsResult.json';

describe('ebscoEdsSearch', function () {

    let receivedTerm, receivedLimiters, receivedSessionToken, receivedAuthToken, receivedAction, ReceivedFacetFilters;
    beforeEach(function () {
        apiServer.router.post(`/edsapi/rest/Search`, function* (next) {
            receivedAction = this.request.body.Actions;
            receivedTerm = this.request.body.SearchCriteria.Queries[0].Term;
            receivedLimiters = this.request.body.SearchCriteria.Limiters;
            ReceivedFacetFilters = this.request.body.SearchCriteria.FacetFilters;
            receivedSessionToken = this.request.header['x-sessiontoken'];
            receivedAuthToken = this.request.header['x-authenticationtoken'];
            yield next;
        }, mockSearch);
        apiServer.start();
    });

    it('should send term, token, limiters action and activeFacets', function* () {
        let result = yield ebscoEdsSearch({
            term: 'aids',
            FT: 'y',
            DT1: '2015-01/2015-11',
            currentPage: 10,
            action: 'action()',
            activeFacets: '%7B%22a%22%3A1%7D'
        }, 'session-token-for-vie', 'authToken');
        assert.equal(receivedTerm, 'aids');
        assert.deepEqual(receivedAction, ['goToPage(10)', 'action()']);
        assert.deepEqual(receivedLimiters, [
            { Id: 'FT', Values: ['y'] },
            { Id: 'DT1', Values: ['2015-01/2015-11'] }
        ]);
        assert.deepEqual(ReceivedFacetFilters, { a: 1});
        assert.equal(receivedSessionToken, 'session-token-for-vie');
        assert.equal(receivedAuthToken, 'authToken');
        assert.deepEqual(result, aidsResult);
    });

    it('should default currentPage to 1 actions to [goToPage(1)] and limiters to empty array if no query given', function* () {
        let result = yield ebscoEdsSearch({ term: 'aids' }, 'session-token-for-vie', 'authToken');
        assert.equal(receivedTerm, 'aids');
        assert.deepEqual(receivedAction, ['goToPage(1)']);
        assert.deepEqual(receivedLimiters, []);
        assert.equal(receivedSessionToken, 'session-token-for-vie');
        assert.equal(receivedAuthToken, 'authToken');
        assert.deepEqual(result, aidsResult);
    });

    it('should ignore limiters that are not allowed', function* () {
        let result = yield ebscoEdsSearch({ term: 'aids', FT: 'y', DT1: '2015-01/2015-11', LA99: [ 'French', 'English' ], disallowed: 'ignored'}, 'session-token-for-vie');
        assert.deepEqual(receivedLimiters, [
            { Id: 'FT', Values: ['y'] },
            { Id: 'DT1', Values: ['2015-01/2015-11'] },
            { Id: 'LA99', Values: ['French', 'English'] }
        ]);
        assert.deepEqual(result, aidsResult);
    });

    afterEach(function () {
        apiServer.close();
    });
});
