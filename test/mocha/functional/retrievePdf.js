import mockRetrieve from '../../mock/controller/retrieve';
import { SearchResult } from '../../mock/controller/aidsResult.json';

const aidsResult = SearchResult.Data.Records;

describe('GET /ebsco/:domainName/article/retrieve_pdf/:dbId/:an', function () {
    let retrieveCall;

    before(function* () {
        yield fixtureLoader.createDomain({ name: 'vie', userId: 'userIdVie', password: 'passwordVie', profile: 'profileVie' });
        yield fixtureLoader.createDomain({ name: 'shs', userId: 'userIdShs', password: 'passwordShs', profile: 'profileShs' });

        yield fixtureLoader.createUser({ username: 'john', password: 'secret', domains: ['vie', 'shs'] });
        yield fixtureLoader.createUser({ username: 'jane', password: 'secret', domains: ['shs'] });

        yield redis.setAsync('vie', 'auth-token-vie');
        yield redis.setAsync('shs', 'auth-token-shs');
        yield redis.setAsync('john-vie', 'session-token-vie');
        yield redis.setAsync('john-shs', 'session-token-shs');
    });

    beforeEach(function* () {
        retrieveCall = null;

        apiServer.router.post(`/edsapi/rest/Retrieve`, function* (next) {
            retrieveCall = {
                authToken: this.header['x-authenticationtoken'],
                sessionToken: this.header['x-sessiontoken']
            };
            yield next;
        }, mockRetrieve);

        apiServer.start();
    });

    it('should return login for given article(dbId, an))', function* () {
        request.setToken({ username: 'john', domains: ['vie', 'shs']});
        const response = yield request.get(`/ebsco/vie/article/retrieve_pdf/${aidsResult[2].Header.DbId}/${aidsResult[2].Header.An}`);
        assert.deepEqual(retrieveCall, {
            authToken: 'auth-token-vie',
            sessionToken: 'session-token-vie'
        });
        assert.deepEqual(JSON.parse(response.body), { url: ['http://content.ebscohost.com/ContentServer.asp?EbscoContent=dGJyMNLe80SeqK84yNfsOLCmr06eprdSr6u4TbSWxWXS&ContentCustomer=dGJyMOzpsE2yrLBPuePfgeyx43zx1%2B6B9N%2Fj&T=P&P=AN&S=R&D=a9h&K=109002134']});
    });

    it('should return error 401 if asking for a domain for which the user has no access', function* () {
        request.setToken({ username: 'jane', domains: ['shs']});
        const response = yield request.get(`/ebsco/vie/article/retrieve_pdf/${aidsResult[1].Header.DbId}/${aidsResult[1].Header.An}`);
        assert.isNull(retrieveCall);
        assert.equal(response.body, `You are not authorized to access domain vie`);
        assert.equal(response.statusCode, 401);
    });

    it('should return error 500 if asking for a domain for which does not access', function* () {
        request.setToken({ username: 'john', domains: ['vie', 'shs']});
        const response = yield request.get(`/ebsco/tech/article/retrieve_pdf/${aidsResult[1].Header.DbId}/${aidsResult[1].Header.An}`);
        assert.isNull(retrieveCall);
        assert.equal(response.body, `Domain tech does not exists`);
        assert.equal(response.statusCode, 500);
    });

    it('should return error 401 if no Authorization token provided', function* () {
        const response = yield request.get(`/ebsco/shs/article/retrieve_pdf/${aidsResult[1].Header.DbId}/${aidsResult[1].Header.An}`, null, null, null);
        assert.isNull(retrieveCall);
        assert.equal(response.statusCode, 401);
        assert.equal(response.body, 'Invalid token\n');
    });

    it('should return error 401 if wrong Authorization token provided', function* () {
        const response = yield request.get(`/ebsco/shs/article/retrieve_pdf/${aidsResult[1].Header.DbId}/${aidsResult[1].Header.An}`, null, 'wrongtoken', 'wrongtoken');
        assert.isNull(retrieveCall);
        assert.equal(response.statusCode, 401);
        assert.equal(response.body, 'Invalid token\n');
    });

    it('should return error 404 no result with wanted dbId, An', function* () {
        request.setToken({ username: 'john', domains: ['vie', 'shs']});
        const response = yield request.get(`/ebsco/shs/article/retrieve_pdf/wrongDbId/wrongAn`);
        assert.deepEqual(retrieveCall, {
            authToken: 'auth-token-shs',
            sessionToken: 'session-token-shs'
        });
        assert.equal(response.statusCode, 404);
        assert.equal(response.body, 'Not Found');
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
