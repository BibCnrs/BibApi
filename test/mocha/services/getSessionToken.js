import co from 'co';
import getSessionToken from '../../../lib/services/getSessionToken';

describe('getSessionToken', function () {
    let getToken;
    let savedTokens = {
        'john-vie': 'vieProfileSessionToken'
    };
    const user = {
        username: 'john',
        domains: ['vie', 'shs']
    };


    let getAsyncCall = [];
    let setAsyncCall = [];
    let expireAsyncCall = [];
    let ebscoSessionCall = [];

    before(function* () {
        const redis = {
            getAsync: function* (name) {
                getAsyncCall.push(name);
                return savedTokens[name];
            },
            setAsync: function* (name, value) {
                setAsyncCall.push({ name, value });
                return savedTokens[name] = value;
            },
            expireAsync: function* (name, ttl) {
                expireAsyncCall.push({ name, ttl });
            }
        };
        const ebscoSession = {
            getSession: function* (profile, token) {
                ebscoSessionCall.push({ profile, token });

                return { SessionToken: `${profile}SessionToken`};
            }
        };
        getToken = getSessionToken(redis, user, ebscoSession);
    });

    it('should throw an error if given user doesnot have access to profile', function* () {
        const error = yield co(getToken('whatever', 'whateverProfileId', 'authToken')).catch(e => e);

        assert.isNotNull(error);
        assert.equal(error.message, 'You are not authorized to access domain whatever');
        assert.equal(error.status, 401);
    });

    describe('token previously saved', function () {

        before(function () {
            savedTokens = {
                'john-vie': 'vieProfileSessionToken'
            };
            getAsyncCall = [];
            setAsyncCall = [];
            expireAsyncCall = [];
            ebscoSessionCall = [];
        });

        it('should return saved token if there is one', function* () {
            let token = yield getToken('vie', 'vieProfile', 'authToken');
            assert.equal(token, 'vieProfileSessionToken');
        });

        it('should have called getAsync with wanted username - profile', function* () {
            assert.deepEqual(getAsyncCall, ['john-vie']);
        });

        it('should not have called any other function', function* () {
            assert.deepEqual(setAsyncCall, []);
            assert.deepEqual(expireAsyncCall, []);
            assert.deepEqual(ebscoSessionCall, []);
        });
    });

    describe('no token previously saved', function () {

        before(function () {
            savedTokens = {
                'john-vie': 'vieProfileSessionToken'
            };
            getAsyncCall = [];
            setAsyncCall = [];
            expireAsyncCall = [];
            ebscoSessionCall = [];
        });

        it('should retrieve a new token and save it if none was saved', function* () {
            let token = yield getToken('shs', 'shsProfile', 'authToken');
            assert.equal(token, 'shsProfileSessionToken');
        });

        it('should have called getAsync with wanted usernmae - profile', function* () {
            assert.deepEqual(getAsyncCall, ['john-shs']);
        });

        it('should have called ebscoSession with wanted profile and token', function* () {
            assert.deepEqual(ebscoSessionCall, [{ profile: 'shsProfile', token: 'authToken' }]);
        });

        it('should have called setAsync with new Token', function* () {
            assert.deepEqual(setAsyncCall, [{ name: 'john-shs', value: 'shsProfileSessionToken' }]);
        });

        it('should have called expireAsync with wanted profile and ttl 1795', function* () {
            assert.deepEqual(expireAsyncCall, [{ name: 'john-shs', ttl: 1795 }]);
        });
    });
});
