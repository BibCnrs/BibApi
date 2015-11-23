'use strict';

import ebscoEdsRetrieve from '../../../lib/services/ebscoEdsRetrieve';
import mockSearch from '../../mock/controller/search';
import aidsResult from '../../mock/controller/aidsResult.json';

describe('ebscoEdsRetrieve', function () {

    let receivedDbId, receivedAn, receivedToken;

    beforeEach(function () {
        apiServer.router.post(`/edsapi/rest/Retrieve`, function* (next) {
            receivedDbId = this.request.body.DbId;
            receivedAn = this.request.body.An;
            receivedToken = this.request.header['x-sessiontoken'];
            yield next;
        }, mockSearch);
        apiServer.start();
    });

    it('should return result list for specific session', function* () {
        let result = yield ebscoEdsRetrieve('db_14', 'an_5', 'token-for-profile-vie');
        assert.equal(receivedDbId, 'db_14');
        assert.equal(receivedAn, 'an_5');
        assert.equal(receivedToken, 'token-for-profile-vie');
        assert.deepEqual(result, aidsResult);
    });

    afterEach(function () {
        apiServer.close();
    });
});
