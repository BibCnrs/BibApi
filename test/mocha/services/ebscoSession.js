'use strict';

import config from 'config';
import * as ebscoSession from '../../../lib/services/ebscoSession';

describe('ebscoSession', function () {

    it('should return sessionToken for specific profile', function* () {
        let result = yield ebscoSession.getSession(config.ebsco.profile.vie);
        assert.deepEqual(result, { SessionToken: 'token-for-profile-vie' });
        result = yield ebscoSession.getSession(config.ebsco.profile.shs);
        assert.deepEqual(result, { SessionToken: 'token-for-profile-shs' });
    });

    it('should throw an error when trying to access wrong profile', function* () {
        let error;
        try {
            yield ebscoSession.getSession('404-profile');
        } catch (e) {
            error = e;
        }

        assert.equal(error.statusCode, 400);
        assert.deepEqual(error.error, {
            DetailedErrorDescription: 'Profile: 404-profile.',
            ErrorDescription: 'Profile ID is not assocated with caller\'s credentials.',
            ErrorNumber: 144
        });
    });

});
