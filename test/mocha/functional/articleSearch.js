import mockSearch from '../../mock/controller/search';
import aidsResult from '../services/parsedAidsResult.json';
import parseDateRange from '../../../lib/services/parseDateRange';

describe('GET /ebsco/:domainName/article/search', function() {
    let searchCall;

    before(function*() {
        const vie = yield fixtureLoader.createCommunity({
            name: 'vie',
            user_id: 'userIdVie',
            password: 'passwordVie',
            profile: 'profileVie',
        });
        const shs = yield fixtureLoader.createCommunity({
            name: 'shs',
            user_id: 'userIdShs',
            password: 'passwordShs',
            profile: 'profileShs',
        });

        yield fixtureLoader.createJanusAccount({
            uid: 'vie_shs',
            communities: [vie.id, shs.id],
        });
        yield fixtureLoader.createJanusAccount({
            uid: 'shs',
            communities: [shs.id],
        });

        yield redis.hsetAsync('vie', 'authToken', 'auth-token-for-vie');
        yield redis.hsetAsync('vie', 'vie_shs', 'session-token-for-vie');

        yield redis.hsetAsync('shs', 'authToken', 'auth-token-for-shs');
        yield redis.hsetAsync('shs', 'vie_shs', 'session-token-for-shs');
        yield redis.hsetAsync('shs', 'shs', 'session-token-for-shs');
    });

    beforeEach(function() {
        searchCall = null;

        apiServer.router.post(
            '/edsapi/rest/Search',
            function*(next) {
                searchCall = {
                    authToken: this.header['x-authenticationtoken'],
                    sessionToken: this.header['x-sessiontoken'],
                };
                yield next;
            },
            mockSearch,
        );

        apiServer.start();
    });

    it('should return a parsed response for logged profile vie', function*() {
        request.setToken({ username: 'vie_shs', domains: ['vie', 'shs'] });
        const response = yield request.get(
            `/ebsco/vie/article/search?queries=${encodeURIComponent(
                JSON.stringify([{ term: 'aids' }]),
            )}`,
        );
        assert.deepEqual(searchCall, {
            authToken: 'auth-token-for-vie',
            sessionToken: 'session-token-for-vie',
        });
        assert.deepEqual(JSON.parse(response.body), aidsResult);
    });

    it('should return a parsed response for logged profile shs', function*() {
        request.setToken({ username: 'vie_shs', domains: ['vie', 'shs'] });
        const response = yield request.get(
            `/ebsco/shs/article/search?queries=${encodeURIComponent(
                JSON.stringify([{ term: 'aids' }]),
            )}`,
        );
        assert.deepEqual(searchCall, {
            authToken: 'auth-token-for-shs',
            sessionToken: 'session-token-for-shs',
        });
        assert.deepEqual(JSON.parse(response.body), aidsResult);
    });

    it('should return simple empty response when no result', function*() {
        request.setToken({ username: 'vie_shs', domains: ['vie', 'shs'] });
        const response = yield request.get(
            `/ebsco/vie/article/search?queries=${encodeURIComponent(
                JSON.stringify([{ term: '404' }]),
            )}`,
        );
        assert.deepEqual(searchCall, {
            authToken: 'auth-token-for-vie',
            sessionToken: 'session-token-for-vie',
        });
        assert.deepEqual(JSON.parse(response.body), {
            totalHits: 0,
            results: [],
            facets: [],
            activeFacets: {},
            currentPage: 1,
            maxPage: 1,
            dateRange: parseDateRange(),
        });
    });

    it('should return error 500 if asking for a profile that does not exists', function*() {
        request.setToken({ username: 'vie_shs', domains: ['vie', 'shs'] });
        const response = yield request.get(
            `/ebsco/tech/article/search?queries=${encodeURIComponent(
                JSON.stringify([{ term: 'aids' }]),
            )}`,
        );
        assert.isNull(searchCall);
        assert.equal(response.body, 'Community tech does not exists');
        assert.equal(response.statusCode, 500);
    });

    it('should return error 401 if asking for a profile for which the user has no access', function*() {
        request.setToken({ username: 'shs', domains: ['shs'] });
        const response = yield request.get(
            `/ebsco/vie/article/search?queries=${encodeURIComponent(
                JSON.stringify([{ term: 'aids' }]),
            )}`,
        );
        assert.isNull(searchCall);
        assert.equal(
            response.body,
            'You are not authorized to access domain vie',
        );
        assert.equal(response.statusCode, 401);
    });

    it('should return error 401 if no Authorization token provided', function*() {
        const response = yield request.get(
            `/ebsco/vie/article/search?queries=${encodeURIComponent(
                JSON.stringify([{ term: 'aids' }]),
            )}`,
            null,
            null,
            null,
        );
        assert.isNull(searchCall);
        assert.equal(response.statusCode, 401);
        assert.equal(response.body, 'Invalid token\n');
    });

    it('should return error 401 if wrong Authorization token provided', function*() {
        const response = yield request.get(
            `/ebsco/vie/article/search?queries=${encodeURIComponent(
                JSON.stringify([{ term: 'aids' }]),
            )}`,
            null,
            'wrongtoken',
            'wrongtoken',
        );
        assert.isNull(searchCall);
        assert.equal(response.statusCode, 401);
        assert.equal(response.body, 'Invalid token\n');
    });

    afterEach(function() {
        request.setToken();
        apiServer.close();
    });

    after(function*() {
        redis.flushdb();
        yield fixtureLoader.clear();
    });
});
