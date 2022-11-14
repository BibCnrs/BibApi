'use strict';

import ebscoPublicationRetrieve from '../../../lib/services/ebscoPublicationRetrieve';
import mockPublicationRetrieve from '../../mock/controller/publicationRetrieve';
import { SearchResult } from '../../mock/controller/rawPublication.json';
const aidsResult = SearchResult.Data.Records;

describe('ebscoPublicationRetrieve', function () {
    let receivedId, receivedSessionToken, receivedAuthToken;

    beforeEach(function () {
        apiServer.router.post(
            '/edsapi/publication/Retrieve',
            function* (next) {
                receivedId = this.request.body.id;
                receivedSessionToken = this.request.header['x-sessiontoken'];
                receivedAuthToken =
                    this.request.header['x-authenticationtoken'];
                yield next;
            },
            mockPublicationRetrieve,
        );
        apiServer.start();
    });

    it('should return result list for specific session', function* () {
        const id = aidsResult[0].Header.id;
        let result = yield ebscoPublicationRetrieve(
            id,
            'session-token-for-vie',
            'auth-token-for-vie',
        );
        assert.equal(receivedId, id);
        assert.equal(receivedSessionToken, 'session-token-for-vie');
        assert.equal(receivedAuthToken, 'auth-token-for-vie');
        assert.deepEqual(result, { Record: aidsResult[0] });
    });

    afterEach(function () {
        apiServer.close();
    });
});
