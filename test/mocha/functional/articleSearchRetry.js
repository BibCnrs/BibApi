import mockSearch from '../../mock/controller/search';
import aidsResult from '../services/parsedAidsResult.json';

describe('Retry GET /ebsco/:domainName/article/search', function () {
    let ebscoCall, validSessionToken;

    before(function* () {
        const vie = yield fixtureLoader.createCommunity({
            name: 'vie',
            user_id: 'userIdVie',
            password: 'passwordVie',
            profile: 'profileVie',
        });

        yield fixtureLoader.createJanusAccount({
            uid: 'vie',
            communities: [vie.id],
        });

        yield redis.hsetAsync('vie', 'authToken', 'auth-token-for-vie');
    });

    beforeEach(function* () {
        yield redis.hsetAsync('vie', 'vie', 'session-token-for-vie-0');
        ebscoCall = [];

        apiServer.router.post(
            '/edsapi/rest/Search',
            function* (next) {
                const authToken = this.header['x-authenticationtoken'];
                const sessionToken = this.header['x-sessiontoken'];
                ebscoCall.push({
                    name: 'search',
                    authToken,
                    sessionToken,
                });
                if (sessionToken === validSessionToken) {
                    return yield next;
                }

                this.status = 400;
                this.body = {
                    DetailedErrorDescription:
                        'Invalid Session Token. Please generate a new one.',
                    ErrorDescription: 'Session Token Invalid',
                    ErrorNumber: '109',
                };
            },
            mockSearch,
        );

        apiServer.router.post('/authservice/rest/UIDAuth', function* () {
            const { UserId, Password } = this.request.body;
            ebscoCall.push({
                ...this.request.body,
                name: 'auth',
            });
            yield Promise.resolve();
            if (UserId === 'userIdVie' && Password === 'passwordVie') {
                return (this.body = {
                    AuthToken: 'auth-token-for-vie',
                    AuthTimeout: '1800',
                });
            }

            this.status = 400;
            this.body = {
                ErrorCode: 1102,
                Reason: 'Invalid Credentials.',
            };
        });

        let nbCreateSessionCall = 0;
        apiServer.router.post('/edsapi/rest/CreateSession', function* () {
            nbCreateSessionCall++;
            yield Promise.resolve();
            const Profile = this.request.body.Profile;
            ebscoCall.push({
                ...this.request.body,
                name: 'session',
                authToken: this.header['x-authenticationtoken'],
            });
            if (Profile === 'profileVie') {
                return (this.body = {
                    SessionToken: `session-token-for-vie-${nbCreateSessionCall}`,
                });
            }

            this.status = 400;
            this.body = {
                DetailedErrorDescription: `Profile: ${Profile}.`,
                ErrorDescription:
                    "Profile ID is not assocated with caller's credentials.",
                ErrorNumber: 144,
            };
        });

        apiServer.start();
    });

    it('should return search result directly if session token is good', function* () {
        validSessionToken = 'session-token-for-vie-0';
        request.setToken({ username: 'vie', domains: ['vie', 'shs'] });
        const response = yield request.get(
            `/ebsco/vie/article/search?queries=${encodeURIComponent(
                JSON.stringify([{ term: 'aids' }]),
            )}`,
        );

        assert.deepEqual(ebscoCall, [
            {
                name: 'search',
                authToken: 'auth-token-for-vie',
                sessionToken: 'session-token-for-vie-0',
            },
        ]);
        assert.deepEqual(JSON.parse(response.body), aidsResult);
    });

    it('should retry with new sessionToken until the token get accepted(4times) ', function* () {
        validSessionToken = 'session-token-for-vie-3';
        request.setToken({ username: 'vie', domains: ['vie', 'shs'] });
        const response = yield request.get(
            `/ebsco/vie/article/search?queries=${encodeURIComponent(
                JSON.stringify([{ term: 'aids' }]),
            )}`,
        );

        assert.deepEqual(ebscoCall, [
            {
                name: 'search',
                authToken: 'auth-token-for-vie',
                sessionToken: 'session-token-for-vie-0',
            },
            {
                name: 'session',
                Guest: 'n',
                Profile: 'profileVie',
                authToken: 'auth-token-for-vie',
            },
            {
                name: 'search',
                authToken: 'auth-token-for-vie',
                sessionToken: 'session-token-for-vie-1',
            },
            {
                name: 'session',
                Guest: 'n',
                Profile: 'profileVie',
                authToken: 'auth-token-for-vie',
            },
            {
                name: 'search',
                authToken: 'auth-token-for-vie',
                sessionToken: 'session-token-for-vie-2',
            },
            {
                name: 'session',
                Guest: 'n',
                Profile: 'profileVie',
                authToken: 'auth-token-for-vie',
            },
            {
                name: 'search',
                authToken: 'auth-token-for-vie',
                sessionToken: 'session-token-for-vie-3',
            },
        ]);
        assert.deepEqual(JSON.parse(response.body), aidsResult);
    });

    it('should give up after 5 try', function* () {
        validSessionToken = 'not-gonna-happen';
        request.setToken({ username: 'vie', domains: ['vie', 'shs'] });
        const response = yield request.get(
            `/ebsco/vie/article/search?queries=${encodeURIComponent(
                JSON.stringify([{ term: 'aids' }]),
            )}`,
        );
        assert.deepEqual(ebscoCall, [
            {
                name: 'search',
                authToken: 'auth-token-for-vie',
                sessionToken: 'session-token-for-vie-0',
            },
            {
                name: 'session',
                Guest: 'n',
                Profile: 'profileVie',
                authToken: 'auth-token-for-vie',
            },
            {
                name: 'search',
                authToken: 'auth-token-for-vie',
                sessionToken: 'session-token-for-vie-1',
            },
            {
                name: 'session',
                Guest: 'n',
                Profile: 'profileVie',
                authToken: 'auth-token-for-vie',
            },
            {
                name: 'search',
                authToken: 'auth-token-for-vie',
                sessionToken: 'session-token-for-vie-2',
            },
            {
                name: 'session',
                Guest: 'n',
                Profile: 'profileVie',
                authToken: 'auth-token-for-vie',
            },
            {
                name: 'search',
                authToken: 'auth-token-for-vie',
                sessionToken: 'session-token-for-vie-3',
            },
            {
                name: 'session',
                Guest: 'n',
                Profile: 'profileVie',
                authToken: 'auth-token-for-vie',
            },
            {
                name: 'search',
                authToken: 'auth-token-for-vie',
                sessionToken: 'session-token-for-vie-4',
            },
        ]);
        assert.equal(
            response.body,
            'Could not connect to ebsco api. Please try again. If the problem persist contact us.',
        );
        const [authToken, sessionToken] = yield redis.hmgetAsync(
            'vie',
            'authToken',
            'vie',
        );
        assert.isNull(authToken);
        assert.isNull(sessionToken);
    });

    afterEach(function () {
        request.setToken();
        apiServer.close();
    });

    after(function* () {
        redis.flushdb();
        yield fixtureLoader.clear();
    });
});
