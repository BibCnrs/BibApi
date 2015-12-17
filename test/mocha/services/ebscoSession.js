'use strict';

import { ebsco } from 'config';
import * as ebscoSession from '../../../lib/services/ebscoSession';
import sessionMockRoute from '../../mock/controller/session';


describe('ebscoSession', function () {
    let receivedProfile;

    beforeEach(function () {
        apiServer.router.post('/edsapi/rest/CreateSession', function* (next) {
            receivedProfile = this.request.body.Profile;
            yield next;
        }, sessionMockRoute);

        apiServer.start();
    });

    it('should return sessionToken for specific profile', function* () {
        let result = yield ebscoSession.getSession(ebsco.profile.vie);
        assert.equal(receivedProfile, ebsco.profile.vie);
        assert.deepEqual(result, { SessionToken: 'token-for-profile-vie' });
        result = yield ebscoSession.getSession(ebsco.profile.shs);

        assert.equal(receivedProfile, ebsco.profile.shs);
        assert.deepEqual(result, { SessionToken: 'token-for-profile-shs' });
    });

    it('should throw an error when trying to access wrong profile', function* () {
        let error;
        try {
            yield ebscoSession.getSession('404-profile');
        } catch (e) {
            error = e;
        }

        assert.equal(receivedProfile, '404-profile');
        assert.equal(error.statusCode, 400);
        assert.deepEqual(error.error, {
            DetailedErrorDescription: 'Profile: 404-profile.',
            ErrorDescription: 'Profile ID is not assocated with caller\'s credentials.',
            ErrorNumber: 144
        });
    });

    afterEach(function () {
        apiServer.close();
    });

});
