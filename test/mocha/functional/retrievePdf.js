import mockRetrieve from '../../mock/controller/retrieve';
import jwt from 'koa-jwt';
import { auth } from 'config';

import { SearchResult } from '../../mock/controller/aidsResult.json';
const aidsResult = SearchResult.Data.Records;

describe('GET /ebsco/:domainName/article/retrieve_pdf/:dbId/:an', function () {
    let token, noVieToken, retrieveCall;

    before(function* () {
        yield fixtureLoader.createDomain({ name: 'vie', userId: 'userIdVie', password: 'passwordVie', profile: 'profileVie' });
        yield fixtureLoader.createDomain({ name: 'shs', userId: 'userIdShs', password: 'passwordShs', profile: 'profileShs' });

        yield fixtureLoader.createUser({ username: 'john', password: 'secret', domains: ['vie', 'shs'] });
        yield fixtureLoader.createUser({ username: 'jane', password: 'secret', domains: ['shs'] });

        yield redis.setAsync('vie', 'auth-token-vie');
        yield redis.setAsync('shs', 'auth-token-shs');
        yield redis.setAsync('john-vie', 'session-token-vie');
        yield redis.setAsync('john-shs', 'session-token-shs');

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
        const response = yield request.get(
            `/ebsco/vie/article/retrieve_pdf/${aidsResult[2].Header.DbId}/${aidsResult[2].Header.An}`,
            token
        );
        assert.deepEqual(retrieveCall, {
            authToken: 'auth-token-vie',
            sessionToken: 'session-token-vie'
        });
        assert.deepEqual(JSON.parse(response), { url: ['http://content.ebscohost.com/ContentServer.asp?EbscoContent=dGJyMNLe80SeqK84yNfsOLCmr06eprdSr6u4TbSWxWXS&ContentCustomer=dGJyMOzpsE2yrLBPuePfgeyx43zx1%2B6B9N%2Fj&T=P&P=AN&S=R&D=a9h&K=109002134']});
    });

    it('should return error 401 if asking for a domain for which the user has no access', function* () {
        const error = yield (request.get(
            `/ebsco/vie/article/retrieve_pdf/${aidsResult[1].Header.DbId}/${aidsResult[1].Header.An}`,
            noVieToken
        ).catch(e => e));
        assert.isNull(retrieveCall);
        assert.equal(error.message, `401 - You are not authorized to access domain vie`);
        assert.equal(error.statusCode, 401);
    });

    it('should return error 500 if asking for a domain for which does not access', function* () {
        const error = yield (request.get(
            `/ebsco/tech/article/retrieve_pdf/${aidsResult[1].Header.DbId}/${aidsResult[1].Header.An}`,
            token
        ).catch(e => e));
        assert.isNull(retrieveCall);
        assert.equal(error.message, `500 - Domain tech does not exists`);
        assert.equal(error.statusCode, 500);
    });

    it('should return error 401 if no Authorization token provided', function* () {
        const error = yield request.get(`/ebsco/shs/article/retrieve_pdf/${aidsResult[1].Header.DbId}/${aidsResult[1].Header.An}`, null).catch((error) => error);
        assert.isNull(retrieveCall);
        assert.equal(error.statusCode, 401);
        assert.equal(error.message, '401 - No Authorization header found\n');
    });

    it('should return error 401 if wrong Authorization token provided', function* () {
        const error = yield request.get(`/ebsco/shs/article/retrieve_pdf/${aidsResult[1].Header.DbId}/${aidsResult[1].Header.An}`, 'wrongtoken').catch((error) => error);
        assert.isNull(retrieveCall);
        assert.equal(error.statusCode, 401);
        assert.equal(error.message, '401 - Invalid token\n');
    });

    it('should return error 404 no result with wanted dbId, An', function* () {
        const error = yield request.get(`/ebsco/shs/article/retrieve_pdf/wrongDbId/wrongAn`, token).catch((error) => error);
        assert.deepEqual(retrieveCall, {
            authToken: 'auth-token-shs',
            sessionToken: 'session-token-shs'
        });
        assert.equal(error.statusCode, 404);
        assert.equal(error.message, '404 - Not Found');
    });

    afterEach(function () {
        apiServer.close();
    });

    after(function* () {
        redis.flushdb();
        yield fixtureLoader.clear();
    });
});
