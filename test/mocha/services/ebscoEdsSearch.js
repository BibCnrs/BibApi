'use strict';

import ebscoEdsSearch from '../../../lib/services/ebscoEdsSearch';
import mockSearch from '../../mock/controller/search';
import aidsResult from '../../mock/controller/aidsResult.json';

describe('ebscoEdsSearch', function () {

    let receivedTerm, receivedLimiters, receivedSessionToken, receivedAuthToken, receivedActions;
    beforeEach(function () {
        apiServer.router.post(`/edsapi/rest/Search`, function* (next) {
            receivedActions = this.request.body.Actions;
            receivedTerm = this.request.body.SearchCriteria.Queries[0].Term;
            receivedLimiters = this.request.body.SearchCriteria.Limiters;
            receivedSessionToken = this.request.header['x-sessiontoken'];
            receivedAuthToken = this.request.header['x-authenticationtoken'];
            yield next;
        }, mockSearch);
        apiServer.start();
    });

    it('should send term, token, limiters and actions', function* () {
        let result = yield ebscoEdsSearch('aids', { FT: 'y', DT1: '2015-01/2015-11', currentPage: 10, actions: [ 'action1', 'action2' ] }, 'session-token-for-vie', 'authToken');
        assert.equal(receivedTerm, 'aids');
        assert.deepEqual(receivedActions, ['goToPage(10)', 'action1', 'action2']);
        assert.deepEqual(receivedLimiters, [
            { Id: 'FT', Values: ['y'] },
            { Id: 'DT1', Values: ['2015-01/2015-11'] }
        ]);
        assert.equal(receivedSessionToken, 'session-token-for-vie');
        assert.equal(receivedAuthToken, 'authToken');
        assert.deepEqual(result, aidsResult);
    });

    it('should default currentPage to 1 actions to [goToPage(1)] and limiters to empty array if no query given', function* () {
        let result = yield ebscoEdsSearch('aids', undefined, 'session-token-for-vie', 'authToken');
        assert.equal(receivedTerm, 'aids');
        assert.deepEqual(receivedActions, ['goToPage(1)']);
        assert.deepEqual(receivedLimiters, []);
        assert.equal(receivedSessionToken, 'session-token-for-vie');
        assert.equal(receivedAuthToken, 'authToken');
        assert.deepEqual(result, aidsResult);
    });

    it('should ignore limiters that are not allowed', function* () {
        let result = yield ebscoEdsSearch('aids', { FT: 'y', DT1: '2015-01/2015-11', disallowed: 'ignored'}, 'session-token-for-vie');
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
