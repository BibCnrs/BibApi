import mockSearch from '../../mock/controller/publicationSearch';
import publicationSearchResult from '../../mock/controller/parsedPublicationSearch.json';
import parseDateRange from '../../../lib/services/parseDateRange';

describe('GET /ebsco/:domainName/publication/search', function () {
    let token, noVieToken, searchCall;

    before(function* () {
        yield fixtureLoader.createDomain({ name: 'vie', userId: 'userIdVie', password: 'passwordVie', profile: 'profileVie' });
        yield fixtureLoader.createDomain({ name: 'shs', userId: 'userIdShs', password: 'passwordShs', profile: 'profileShs' });

        yield fixtureLoader.createUser({ username: 'john', password: 'secret', domains: ['vie', 'shs'] });
        yield fixtureLoader.createUser({ username: 'jane', password: 'secret', domains: ['shs'] });

        yield redis.setAsync('vie', 'auth-token-for-vie');
        yield redis.setAsync('shs', 'auth-token-for-shs');
        yield redis.setAsync('guest-vie', 'session-token-for-vie');
        yield redis.setAsync('guest-shs', 'session-token-for-shs');

        token = (yield request.post('/ebsco/login', {
            username: 'john',
            password: 'secret'
        }, null)).token;
        noVieToken = (yield request.post('/ebsco/login', {
            username: 'jane',
            password: 'secret'
        }, null)).token;
    });

    beforeEach(function* () {
        searchCall = null;

        apiServer.router.post(`/edsapi/publication/Search`, function* (next) {
            searchCall = {
                authToken: this.header['x-authenticationtoken'],
                sessionToken: this.header['x-sessiontoken']
            };
            yield next;
        }, mockSearch);

        apiServer.start();
    });

    it('should return a parsed response for logged profile vie', function* () {
        const response = yield request.get(`/ebsco/vie/publication/search?queries=${encodeURIComponent(JSON.stringify([{ term: 'aids' }]))}`, token);
        assert.deepEqual(searchCall, {
            authToken: 'auth-token-for-vie',
            sessionToken: 'session-token-for-vie'
        });
        assert.deepEqual(JSON.parse(response), publicationSearchResult);
    });

    it('should return a parsed response for logged profile shs', function* () {
        const response = yield request.get(`/ebsco/shs/publication/search?queries=${encodeURIComponent(JSON.stringify([{ term: 'aids' }]))}`, token);
        assert.deepEqual(searchCall, {
            authToken: 'auth-token-for-shs',
            sessionToken: 'session-token-for-shs'
        });
        assert.deepEqual(JSON.parse(response), publicationSearchResult);
    });

    it('should return simple empty response when no result', function* () {
        const response = yield request.get(`/ebsco/vie/publication/search?queries=${encodeURIComponent(JSON.stringify([{ term: '404' }]))}`, token);
        assert.deepEqual(searchCall, {
            authToken: 'auth-token-for-vie',
            sessionToken: 'session-token-for-vie'
        });
        assert.deepEqual(JSON.parse(response), {
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
        const error = yield (request.get(`/ebsco/tech/publication/search?queries=${encodeURIComponent(JSON.stringify([{ term: 'aids' }]))}`, token).catch(e => e));
        assert.isNull(searchCall);
        assert.equal(error.message, `500 - Domain tech does not exists`);
        assert.equal(error.statusCode, 500);
    });

    it('should return a parsed response even if asking for a profile for which the user has no access', function* () {
        const response = yield (request.get(`/ebsco/vie/publication/search?queries=${encodeURIComponent(JSON.stringify([{ term: 'aids' }]))}`, noVieToken));
        assert.deepEqual(searchCall, {
            authToken: 'auth-token-for-vie',
            sessionToken: 'session-token-for-vie'
        });
        assert.deepEqual(JSON.parse(response), publicationSearchResult);
    });

    it('should return a parsed response even if no Authorization token provided', function* () {
        const response = yield request.get(`/ebsco/vie/publication/search?queries=${encodeURIComponent(JSON.stringify([{ term: 'aids' }]))}`, null);
        assert.deepEqual(searchCall, {
            authToken: 'auth-token-for-vie',
            sessionToken: 'session-token-for-vie'
        });
        assert.deepEqual(JSON.parse(response), publicationSearchResult);
    });

    it('should return a parsed response even if wrong Authorization token provided', function* () {
        const response = yield request.get(`/ebsco/vie/publication/search?queries=${encodeURIComponent(JSON.stringify([{ term: 'aids' }]))}`, 'wrongtoken');
        assert.deepEqual(searchCall, {
            authToken: 'auth-token-for-vie',
            sessionToken: 'session-token-for-vie'
        });
        assert.deepEqual(JSON.parse(response), publicationSearchResult);
    });

    afterEach(function () {
        apiServer.close();
    });

    after(function* () {
        redis.flushdb();
        yield fixtureLoader.clear();
    });
});
