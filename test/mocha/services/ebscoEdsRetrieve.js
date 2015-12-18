'use strict';

import ebscoEdsRetrieve from '../../../lib/services/ebscoEdsRetrieve';
import mockRetrieve from '../../mock/controller/retrieve';
import { SearchResult } from '../../mock/controller/aidsResult.json';
const aidsResult = SearchResult.Data.Records;

describe('ebscoEdsRetrieve', function () {

    let receivedDbId, receivedAn, receivedToken;

    beforeEach(function () {
        apiServer.router.post(`/edsapi/rest/Retrieve`, function* (next) {
            receivedDbId = this.request.body.DbId;
            receivedAn = this.request.body.An;
            receivedToken = this.request.header['x-sessiontoken'];
            yield next;
        }, mockRetrieve);
        apiServer.start();
    });

    it('should return result list for specific session', function* () {
        const dbId = aidsResult[0].Header.DbId;
        const an = aidsResult[0].Header.An;
        let result = yield ebscoEdsRetrieve(dbId, an, 'token-for-profile-vie');
        assert.equal(receivedDbId, dbId);
        assert.equal(receivedAn, an);
        assert.equal(receivedToken, 'token-for-profile-vie');
        assert.deepEqual(result, { Record: aidsResult[0] });
    });

    afterEach(function () {
        apiServer.close();
    });
});
