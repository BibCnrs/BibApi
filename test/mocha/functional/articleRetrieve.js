import mockRetrieve from '../../mock/controller/retrieve';
import retrieveArticleParser from '../../../lib/services/retrieveArticleParser';

import { SearchResult } from '../../mock/controller/aidsResult.json';
const aidsResult = SearchResult.Data.Records;

describe('GET /ebsco/:domainName/article/retrieve/:term?dbid&an', function() {
    let retrieveCall;

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
            uid: 'john',
            communities: [vie.id, shs.id],
        });
        yield fixtureLoader.createJanusAccount({
            uid: 'jane',
            communities: [shs.id],
        });

        yield redis.hsetAsync('vie', 'authToken', 'auth-token-vie');
        yield redis.hsetAsync('vie', 'john', 'session-token-vie');

        yield redis.hsetAsync('shs', 'authToken', 'auth-token-shs');
        yield redis.hsetAsync('shs', 'john', 'session-token-shs');
        yield redis.hsetAsync('shs', 'jane', 'session-token-shs');
    });

    beforeEach(function() {
        retrieveCall = null;

        apiServer.router.post(
            '/edsapi/rest/Retrieve',
            function*(next) {
                retrieveCall = {
                    authToken: this.header['x-authenticationtoken'],
                    sessionToken: this.header['x-sessiontoken'],
                };
                yield next;
            },
            mockRetrieve,
        );

        apiServer.start();
    });

    it('should return a parsed response for logged profile vie', function*() {
        request.setToken({ username: 'john', domains: ['vie', 'shs'] });
        const response = yield request.get(
            `/ebsco/vie/article/retrieve?dbid=${aidsResult[0].Header.DbId}&an=${aidsResult[0].Header.An}`,
        );
        assert.deepEqual(retrieveCall, {
            authToken: 'auth-token-vie',
            sessionToken: 'session-token-vie',
        });
        assert.deepEqual(
            response.body,
            JSON.stringify(yield retrieveArticleParser(aidsResult[0])),
        );
    });

    it('should return a parsed response for logged profile shs', function*() {
        request.setToken({ username: 'john', domains: ['vie', 'shs'] });
        const response = yield request.get(
            `/ebsco/shs/article/retrieve?dbid=${aidsResult[1].Header.DbId}&an=${aidsResult[1].Header.An}`,
        );
        assert.deepEqual(retrieveCall, {
            authToken: 'auth-token-shs',
            sessionToken: 'session-token-shs',
        });
        assert.deepEqual(
            response.body,
            JSON.stringify(yield retrieveArticleParser(aidsResult[1])),
        );
    });

    it('should return error 401 if asking for a profile for which the user has no access', function*() {
        request.setToken({ username: 'jane', domains: ['shs'] });
        const response = yield request.get(
            `/ebsco/vie/article/retrieve?dbid=${aidsResult[1].Header.DbId}&an=${aidsResult[1].Header.An}`,
        );
        assert.isNull(retrieveCall);
        assert.equal(
            response.body,
            'You are not authorized to access domain vie',
        );
        assert.equal(response.statusCode, 401);
    });

    it('should return error 500 if asking for a profile for which does not access', function*() {
        request.setToken({ username: 'john', domains: ['vie', 'shs'] });
        const response = yield request.get(
            `/ebsco/tech/article/retrieve?dbid=${aidsResult[1].Header.DbId}&an=${aidsResult[1].Header.An}`,
        );
        assert.isNull(retrieveCall);
        assert.equal(response.body, 'Community tech does not exists');
        assert.equal(response.statusCode, 500);
    });

    it('should return error 401 if no Authorization token provided', function*() {
        const response = yield request.get(
            `/ebsco/shs/article/retrieve?dbid=${aidsResult[1].Header.DbId}&an=${aidsResult[1].Header.An}`,
            null,
            null,
            null,
        );
        assert.isNull(retrieveCall);
        assert.equal(response.statusCode, 401);
        assert.equal(response.body, 'Invalid token\n');
    });

    it('should return error 401 if wrong Authorization token provided', function*() {
        const response = yield request.get(
            `/ebsco/shs/article/retrieve?dbid=${aidsResult[1].Header.DbId}&an=${aidsResult[1].Header.An}`,
            null,
            'wrongtoken',
            'wrongtoken',
        );
        assert.isNull(retrieveCall);
        assert.equal(response.statusCode, 401);
        assert.equal(response.body, 'Invalid token\n');
    });

    it('should return error 404 no result with wanted dbId, An', function*() {
        request.setToken({ username: 'john', domains: ['vie', 'shs'] });
        const response = yield request.get(
            '/ebsco/shs/article/retrieve?dbid=wrongDbId&an=wrongAn',
        );
        assert.deepEqual(retrieveCall, {
            authToken: 'auth-token-shs',
            sessionToken: 'session-token-shs',
        });
        assert.equal(response.statusCode, 404);
        assert.equal(response.body, 'Not Found');
    });

    afterEach(function() {
        apiServer.close();
        request.setToken();
    });

    after(function*() {
        redis.flushdb();
        yield fixtureLoader.clear();
    });
});
