import jwt from 'koa-jwt';
import { auth } from 'config';

describe('/ezticket', function () {
    let user, unauthorizedUser;

    before(function* () {
        yield fixtureLoader.createDomain({ name: 'vie', gate: 'insb' });
        yield fixtureLoader.createDomain({ name: 'shs', gate: 'inshs' });
        user = yield fixtureLoader.createUser({ username: 'johnny', password: 'secret', domains: ['vie', 'shs'] });
        unauthorizedUser = yield fixtureLoader.createUser({ username: 'jane', password: 'secret', domains: ['shs'] });
    });

    it('should redirect to ezticket/login', function* () {
        const error = yield request.get('/ezticket?gate=insb.test.com&url=google.fr').catch(error => error);
        assert.equal(error.message, '302 - Redirecting to <a href="ezticket/login?gate=insb.test.com&amp;url=google.fr">ezticket/login?gate=insb.test.com&amp;url=google.fr</a>.');
    });

    it('should return error 500 if gate does not exists', function* () {
        const error = yield request.get('/ezticket?gate=fake.test.com&url=google.fr').catch(error => error);
        assert.equal(error.message, '500 - There is no domain for gate fake.test.com');
    });

    it('should redirect to ezticket/login when token is wrong', function* () {
        const error = yield request.get('/ezticket?gate=insb.test.com&url=google.fr', 'wrong token').catch(error => error);
        assert.equal(error.message, '302 - Redirecting to <a href="ezticket/login?gate=insb.test.com&amp;url=google.fr">ezticket/login?gate=insb.test.com&amp;url=google.fr</a>.');
    });

    it('should redirect to generated url when posting /login with correct username and password', function* () {
        const error = yield request.post('/ezticket/login?gate=insb.test.com&url=http://google.fr', { username: user.username, password: user.password }).catch(error => error);
        assert.match(error.message, /302 - Redirecting to\s+http:\/\/insb\.test\.com\/login\?user=johnny.*?%24ginsb%2Binshs/);
    });

    it('should redirect to generated url when correct authorization header is present', function* () {
        const token = jwt.sign({
            username: 'johnny',
            domains: ['vie', 'shs']
        }, auth.secret);
        yield redis.setAsync('vie', 'auth-token-for-vie');
        yield redis.setAsync('shs', 'auth-token-for-shs');
        yield redis.setAsync('john-vie', 'session-token-for-vie');
        yield redis.setAsync('john-shs', 'session-token-for-shs');
        const error = yield request.get('/ezticket?gate=insb.test.com&url=http://google.fr', token).catch(error => error);
        assert.match(error.message, /302 - Redirecting to.*?http:\/\/insb\.test\.com\/login\?user=johnny.*?%24ginsb%2Binshs/);
    });

    describe('login', function () {

        it('should return 401 when posting /login a user with no access to the current gate', function* () {
            const error = yield request.post('/ezticket/login?gate=insb.test.com&url=http://google.fr', {
                username: unauthorizedUser.username,
                password: unauthorizedUser.password
            }, null).catch(error => error);
            assert.equal(error.message, '401 - Unauthorized');
        });

        it('should return 401 when wrong user', function* () {
            const error = yield request.post('/ezticket/login?gate=insb.test.com&url=http://google.fr', {
                username: 'whatever',
                password: 'whatever'
            }, null).catch(error => error);
            assert.equal(error.message, '401 - Unauthorized');
        });
    });


    after(function* () {
        yield fixtureLoader.clear();
    });
});
