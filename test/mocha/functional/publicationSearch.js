import mockSearch from '../../mock/controller/publicationSearch';
import publicationSearchResult from '../../mock/controller/parsedPublicationSearch.json';
import parseDateRange from '../../../lib/services/parseDateRange';

describe('GET /ebsco/:domainName/publication/search', function () {
    let user, noVieUser, searchCall;

    before(function* () {
        yield fixtureLoader.createCommunity({ name: 'vie', user_id: 'userIdVie', password: 'passwordVie', profile: 'profileVie' });
        yield fixtureLoader.createCommunity({ name: 'shs', user_id: 'userIdShs', password: 'passwordShs', profile: 'profileShs' });

        user =yield fixtureLoader.createJanusAccount({ uid: 'john', domains: ['vie', 'shs'] });
        noVieUser = yield fixtureLoader.createJanusAccount({ uid: 'jane', domains: ['shs'] });

        yield redis.hmsetAsync('vie', 'authToken', 'auth-token-for-vie');
        yield redis.hmsetAsync('vie', 'guest', 'session-token-for-vie');

        yield redis.hmsetAsync('shs', 'authToken', 'auth-token-for-shs');
        yield redis.hmsetAsync('shs', 'guest', 'session-token-for-shs');
    });

    beforeEach(function () {
        searchCall = null;

        apiServer.router.post('/edsapi/publication/Search', function* (next) {
            searchCall = {
                authToken: this.header['x-authenticationtoken'],
                sessionToken: this.header['x-sessiontoken']
            };
            yield next;
        }, mockSearch);

        apiServer.start();
    });

    it('should return a parsed response for logged profile vie', function* () {
        request.setToken(user);
        const response = yield request.get(`/ebsco/vie/publication/search?queries=${encodeURIComponent(JSON.stringify([{ term: 'aids' }]))}`);
        assert.deepEqual(searchCall, {
            authToken: 'auth-token-for-vie',
            sessionToken: 'session-token-for-vie'
        });
        assert.deepEqual(JSON.parse(response.body), publicationSearchResult);
    });

    it('should return a parsed response for logged profile shs', function* () {
        request.setToken(noVieUser);
        const response = yield request.get(`/ebsco/shs/publication/search?queries=${encodeURIComponent(JSON.stringify([{ term: 'aids' }]))}`);
        assert.deepEqual(searchCall, {
            authToken: 'auth-token-for-shs',
            sessionToken: 'session-token-for-shs'
        });
        assert.deepEqual(JSON.parse(response.body), publicationSearchResult);
    });

    it('should return simple empty response when no result', function* () {
        request.setToken(user);
        const response = yield request.get(`/ebsco/vie/publication/search?queries=${encodeURIComponent(JSON.stringify([{ term: '404' }]))}`);
        assert.deepEqual(searchCall, {
            authToken: 'auth-token-for-vie',
            sessionToken: 'session-token-for-vie'
        });
        assert.deepEqual(JSON.parse(response.body), {
            totalHits: 0,
            results: [],
            facets: [],
            activeFacets: {},
            currentPage: 1,
            maxPage: 1,
            dateRange: parseDateRange()
        });
    });

    it('should return error 500 if asking for a profile that does not exists', function* () {
        request.setToken(user);
        const response = yield request.get(`/ebsco/tech/publication/search?queries=${encodeURIComponent(JSON.stringify([{ term: 'aids' }]))}`);
        assert.isNull(searchCall);
        assert.equal(response.body, 'Domain tech does not exists');
        assert.equal(response.statusCode, 500);
    });

    it('should return a parsed response even if asking for a profile for which the user has no access', function* () {
        request.setToken(noVieUser);
        const response = yield (request.get(`/ebsco/vie/publication/search?queries=${encodeURIComponent(JSON.stringify([{ term: 'aids' }]))}`));
        assert.deepEqual(searchCall, {
            authToken: 'auth-token-for-vie',
            sessionToken: 'session-token-for-vie'
        });
        assert.deepEqual(JSON.parse(response.body), publicationSearchResult);
    });

    it('should return a parsed response even if no Authorization token provided', function* () {
        const response = yield request.get(`/ebsco/vie/publication/search?queries=${encodeURIComponent(JSON.stringify([{ term: 'aids' }]))}`, null, null, null);
        assert.deepEqual(searchCall, {
            authToken: 'auth-token-for-vie',
            sessionToken: 'session-token-for-vie'
        });
        assert.deepEqual(JSON.parse(response.body), publicationSearchResult);
    });

    it('should return a parsed response even if wrong Authorization token provided', function* () {
        const response = yield request.get(`/ebsco/vie/publication/search?queries=${encodeURIComponent(JSON.stringify([{ term: 'aids' }]))}`, null, 'wrongtoken', 'wrongtoken');
        assert.deepEqual(searchCall, {
            authToken: 'auth-token-for-vie',
            sessionToken: 'session-token-for-vie'
        });
        assert.deepEqual(JSON.parse(response.body), publicationSearchResult);
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
