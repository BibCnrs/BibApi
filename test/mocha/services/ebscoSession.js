import ebscoSession from '../../../lib/services/ebscoSession';
import sessionMockRoute from '../../mock/controller/session';

describe('ebscoSession', function() {
    let receivedProfile;

    beforeEach(function() {
        apiServer.router.post(
            '/edsapi/rest/CreateSession',
            function*(next) {
                receivedProfile = this.request.body.Profile;
                yield next;
            },
            sessionMockRoute,
        );

        apiServer.start();
    });

    it('should return sessionToken for specific profile', function*() {
        let result = yield ebscoSession('profileVie');
        assert.equal(receivedProfile, 'profileVie');
        assert.deepEqual(result, { SessionToken: 'token-for-profile-vie' });
        result = yield ebscoSession('profileShs');

        assert.equal(receivedProfile, 'profileShs');
        assert.deepEqual(result, { SessionToken: 'token-for-profile-shs' });
    });

    it('should throw an error when trying to access wrong profile', function*() {
        let error;
        try {
            yield ebscoSession('404-profile');
        } catch (e) {
            error = e;
        }

        assert.equal(receivedProfile, '404-profile');
        assert.equal(error.status, 400);
        assert.deepEqual(
            error.message,
            "Profile ID is not assocated with caller's credentials.",
        );
    });

    afterEach(function() {
        apiServer.close();
    });
});
