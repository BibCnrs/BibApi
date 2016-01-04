import getAuthenticationToken from '../../../lib/services/getAuthenticationToken';

describe('getAuthenticationToken', function () {
    let getToken;
    let savedTokens = {
        vie: 'vie'
    };
    const ebscoConfig = {
        vie: {
            userId: 'vieUserId',
            password: 'viePassword'
        },
        shs: {
            userId: 'shsUserId',
            password: 'shsPassword'
        }
    };
    let getAsyncCall = [];
    let setAsyncCall = [];
    let expireAsyncCall = [];
    let ebscoAuthenticationCall = [];

    before(function() {
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
        const ebscoAuthentication = function* (userId, password) {
            ebscoAuthenticationCall.push({ userId, password });

            return {
                AuthToken: `${userId}Token`,
                AuthTimeout: 1800
            };
        };
        getToken = getAuthenticationToken(redis, ebscoAuthentication, ebscoConfig);
    });

    describe('token previously saved', function () {

        before(function () {
            savedTokens = {
                vie: 'vieUserIdToken'
            };
            getAsyncCall = [];
            setAsyncCall = [];
            expireAsyncCall = [];
            ebscoAuthenticationCall = [];
        });

        it('should return saved token if there is one', function* () {
            let token = yield getToken('vie');
            assert.equal(token, 'vieUserIdToken');
        });

        it('should have called getAsyncCall with wanted profile', function* () {
            assert.deepEqual(getAsyncCall, ['vie']);
        });

        it('should not have called any other function', function* () {
            assert.deepEqual(setAsyncCall, []);
            assert.deepEqual(expireAsyncCall, []);
            assert.deepEqual(ebscoAuthenticationCall, []);
        });
    });

    describe('no token previously saved', function () {

        before(function () {
            savedTokens = {
                vie: 'vieUserIdToken'
            };
            getAsyncCall = [];
            setAsyncCall = [];
            expireAsyncCall = [];
            ebscoAuthenticationCall = [];
        });

        it('should retrieve a new token and save it if none was saved', function* () {
            let token = yield getToken('shs');
            assert.equal(token, 'shsUserIdToken');
        });

        it('should have called getAsync with wanted profile', function* () {
            assert.deepEqual(getAsyncCall, ['shs']);
        });

        it('should have called ebscoAuthentication with userId and password for wanted profile', function* () {
            assert.deepEqual(ebscoAuthenticationCall, [ebscoConfig['shs']]);
        });

        it('should have called setAsync with new Token', function* () {
            assert.deepEqual(setAsyncCall, [{ name: 'shs', value: 'shsUserIdToken' }]);
        });

        it('should have called expireAsync with wanted profile and returned AuthTimeout - 5', function* () {
            assert.deepEqual(expireAsyncCall, [{ name: 'shs', ttl: 1800 - 5 }]);
        });
    });
});
