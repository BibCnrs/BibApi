import co from 'co';
import ebscoToken from '../../../lib/services/ebscoToken';

const noop = () => Promise.resolve();

describe('ebscoToken', function () {
    let configuredEbscoToken;
    let redisData = {
        INSB: {
            authToken: 'INSB authToken',
            john: 'john INSB sessionToken'
        },
        INSHS: {
            authToken: 'INSHS authToken'
        }
    };
    const user = {
        username: 'john',
        domains: ['INSB', 'INSHS', 'INC']
    };
    let hmgetAsyncCall;
    let hsetAsyncCall;
    let expireAsyncCall;
    let ebscoSessionCall;
    let ebscoAuthenticationCall;
    let hdelAsyncCall;

    before(function () {
        const redis = {
            hmgetAsync: function* (name, key1, key2) {
                yield noop();
                hmgetAsyncCall.push({ name, key1, key2 });
                return [
                    redisData[name] && redisData[name][key1] || undefined,
                    redisData[name] && redisData[name][key2] || undefined
                ];
            },
            hsetAsync: function* (name, key, value) {
                yield noop();
                hsetAsyncCall.push({ name, key, value });
            },
            expireAsync: function* (name, ttl) {
                yield noop();
                expireAsyncCall.push({ name, ttl });
            },
            hdelAsync: function* (key, subKey) {
                yield noop();
                hdelAsyncCall.push({ key, subKey });
            }
        };
        const ebscoSession = function* (profile, token) {
            yield noop();
            ebscoSessionCall.push({ profile, token });

            return { SessionToken: 'ebscoSessionToken' };
        };

        const ebscoAuthentication = function* (userId, password) {
            yield noop();
            ebscoAuthenticationCall.push({ userId, password });

            return {
                AuthToken: 'ebscoAuthToken',
                AuthTimeout: 1800
            };
        };
        configuredEbscoToken = ebscoToken(redis, user.username, user.domains, ebscoSession, ebscoAuthentication);
    });

    beforeEach(function () {
        hmgetAsyncCall = [];
        hsetAsyncCall = [];
        expireAsyncCall = [];
        ebscoSessionCall = [];
        ebscoAuthenticationCall = [];
        hdelAsyncCall = [];
    });

    describe('.get' , function () {
        it('should return redis stored value when present', function* () {
            const result = yield configuredEbscoToken.get('INSB', 'user_id', 'password', 'profile');
            assert.deepEqual(result, { authToken: 'INSB authToken', sessionToken: 'john INSB sessionToken' });
            assert.deepEqual(hmgetAsyncCall, [{ name: 'INSB', key1: 'authToken', key2: user.username }]);
            assert.deepEqual(ebscoAuthenticationCall, []);
            assert.deepEqual(ebscoSessionCall, []);
            assert.deepEqual(hsetAsyncCall, []);
            assert.deepEqual(expireAsyncCall, []);
        });

        it('should return authToken stored in redis and retrieve sessionToken from ebsco, if sessionToken is absent for user', function* () {
            const result = yield configuredEbscoToken.get('INSHS', 'user_id', 'password', 'profile');
            assert.deepEqual(result, { authToken: 'INSHS authToken', sessionToken: 'ebscoSessionToken' });
            assert.deepEqual(hmgetAsyncCall, [{ name: 'INSHS', key1: 'authToken', key2: user.username }]);
            assert.deepEqual(ebscoAuthenticationCall, []);
            assert.deepEqual(ebscoSessionCall, [{ profile: 'profile', token: 'INSHS authToken' }]);
            assert.deepEqual(hsetAsyncCall, [{ name: 'INSHS', key: user.username, value: 'ebscoSessionToken' }]);
            assert.deepEqual(expireAsyncCall, []);
        });

        it('should return authToken and sessionToken from ebsco, if domain is absent from redis', function* () {
            const result = yield configuredEbscoToken.get('INC', 'user_id', 'password', 'profile');
            assert.deepEqual(result, { authToken: 'ebscoAuthToken', sessionToken: 'ebscoSessionToken' });
            assert.deepEqual(hmgetAsyncCall, [{ name: 'INC', key1: 'authToken', key2: user.username }]);
            assert.deepEqual(ebscoAuthenticationCall, [{ userId: 'user_id', password: 'password' }]);
            assert.deepEqual(ebscoSessionCall, [{ profile: 'profile', token: 'ebscoAuthToken' }]);
            assert.deepEqual(hsetAsyncCall, [
                { name: 'INC', key: 'authToken', value: 'ebscoAuthToken' },
                { name: 'INC', key: user.username, value: 'ebscoSessionToken' }
            ]);
            assert.deepEqual(expireAsyncCall, [{ name: 'INC', ttl: 1795 }]);
        });

        it('should throw an error if target domain is not in user.domains', function* () {
            const error = yield co(configuredEbscoToken.get('IN2P3', 'user_id', 'password', 'profile'))
            .catch(e => e);

            const expectedError = new Error('You are not authorized to access domain IN2P3');
            expectedError.status = 401;
            assert.deepEqual(error, expectedError);
        });
    });

    describe('invalidate', function () {
        it('should call delAsync with domainName', function* () {
            yield configuredEbscoToken.invalidate('INC');
            assert.deepEqual(hdelAsyncCall, [{ key: 'INC', subKey: 'john' }]);
        });
    });
});
