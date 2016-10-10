import ebscoAuthentication from '../../../lib/services/ebscoAuthentication';
import authenticationMockRoute from '../../mock/controller/authentication';

describe('ebscoAuthentication', function () {
    let receivedBody;

    beforeEach(function () {
        apiServer.router.post('/authservice/rest/UIDAuth', function* (next) {
            receivedBody = this.request.body;
            yield next;
        }, authenticationMockRoute);

        apiServer.start();
    });

    it('should return sessionToken for specific profile', function* () {
        let result = yield ebscoAuthentication('vieUserId', 'viePassword');
        assert.deepEqual(receivedBody, {
            UserId: 'vieUserId',
            Password: 'viePassword'
        });
        assert.deepEqual(result, { SessionToken: 'auth-token-for-vie' });

        result = yield ebscoAuthentication('shsUserId', 'shsPassword');
        assert.deepEqual(receivedBody, {
            UserId: 'shsUserId',
            Password: 'shsPassword'
        });
        assert.deepEqual(result, { SessionToken: 'auth-token-for-shs' });
    });

    it('should throw an error when giving wrong redentials', function* () {
        let error;
        try {
            yield ebscoAuthentication('vieUserId', 'wrong_password');
        } catch (e) {
            error = e;
        }

        assert.deepEqual(receivedBody, { UserId: 'vieUserId', Password: 'wrong_password' });
        assert.equal(error.status, 400);
        assert.deepEqual(error.message, 'Invalid Credentials.');
    });

    afterEach(function () {
        apiServer.close();
    });

});
