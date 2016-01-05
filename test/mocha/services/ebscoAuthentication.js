import { ebsco } from 'config';
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
        let result = yield ebscoAuthentication(ebsco.vie.userId, ebsco.vie.password);
        assert.deepEqual(receivedBody, {
            UserId: ebsco.vie.userId,
            Password: ebsco.vie.password
        });
        assert.deepEqual(result, { SessionToken: 'auth-token-for-vie' });

        result = yield ebscoAuthentication(ebsco.shs.userId, ebsco.shs.password);
        assert.deepEqual(receivedBody, {
            UserId: ebsco.shs.userId,
            Password: ebsco.shs.password
        });
        assert.deepEqual(result, { SessionToken: 'auth-token-for-shs' });
    });

    it('should throw an error when giving wrong redentials', function* () {
        let error;
        try {
            yield ebscoAuthentication(ebsco.vie.userId, 'wrong_password');
        } catch (e) {
            error = e;
        }

        assert.deepEqual(receivedBody, { UserId: ebsco.vie.userId, Password: 'wrong_password' });
        assert.equal(error.statusCode, 400);
        assert.deepEqual(error.error, {
            ErrorCode: 1102,
            Reason: 'Invalid Credentials.'
        });
    });

    afterEach(function () {
        apiServer.close();
    });

});
