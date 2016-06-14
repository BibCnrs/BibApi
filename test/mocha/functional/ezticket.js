describe('/ezticket', function () {
    let inistAccount, unauthorizedUser;

    before(function* () {
        yield fixtureLoader.createDomain({ name: 'vie', gate: 'insb' });
        yield fixtureLoader.createDomain({ name: 'shs', gate: 'inshs' });
        yield fixtureLoader.createDomain({ name: 'inc', gate: 'inc' });
        inistAccount = yield fixtureLoader.createInistAccount({ username: 'johnny', password: 'secret', domains: ['vie', 'shs'] });
        unauthorizedUser = yield fixtureLoader.createInistAccount({ username: 'jane', password: 'secret', domains: ['shs'] });
    });

    it('should redirect to ezticket/login', function* () {
        const response = yield request.get('/ezticket?gate=insb.test.com&url=google.fr');
        assert.equal(response.body, 'Redirecting to <a href="ezticket/login?gate=insb.test.com&amp;url=google.fr">ezticket/login?gate=insb.test.com&amp;url=google.fr</a>.');
    });

    it('should return error 500 if gate does not exists', function* () {
        const response = yield request.get('/ezticket?gate=fake.test.com&url=google.fr');
        assert.equal(response.body, 'There is no domain for gate fake.test.com');
    });

    it('should redirect to ezticket/login when token is wrong', function* () {
        const response = yield request.get('/ezticket?gate=insb.test.com&url=google.fr', 'wrong token');
        assert.equal(response.body, 'Redirecting to <a href="ezticket/login?gate=insb.test.com&amp;url=google.fr">ezticket/login?gate=insb.test.com&amp;url=google.fr</a>.');
    });

    it('should redirect to generated url when correct cookie is present', function* () {
        request.setToken({ username: inistAccount.username, domains: ['vie', 'shs'] });

        const response = yield request.get('/ezticket?gate=insb.test.com&url=http://google.fr');
        assert.match(response.body, /Redirecting to.*?http:\/\/insb\.test\.com\/login\?user=johnny.*?%24ginsb%2Binshs/);
    });

    it('should redirect to ezticket/login when logged user has no access to domain', function* () {
        const token = (yield request.post('/ebsco/login', {
            username: inistAccount.username,
            password: inistAccount.password
        }, null)).token;

        const response = yield request.get('/ezticket?gate=inc.test.com&url=google.fr', token);
        assert.equal(response.body, 'Redirecting to <a href="ezticket/login?gate=inc.test.com&amp;url=google.fr">ezticket/login?gate=inc.test.com&amp;url=google.fr</a>.');
    });

    describe('login', function () {

        it('should redirect to generated url', function* () {
            const response = yield request.post('/ezticket/login?gate=insb.test.com&url=http://google.fr', {
                username: inistAccount.username,
                password: inistAccount.password
            });

            assert.match(response.body, /http:\/\/insb\.test\.com\/login\?user=johnny.*?%24ginsb%2Binshs/);
        });

        it('should return 401 when posting /login a user with no access to the current gate', function* () {
            const response = yield request.post('/ezticket/login?gate=insb.test.com&url=http://google.fr', {
                username: unauthorizedUser.username,
                password: unauthorizedUser.password
            }, null);
            assert.equal(response.body, 'Unauthorized');
        });

        it('should return 401 when wrong user', function* () {
            const response = yield request.post('/ezticket/login?gate=insb.test.com&url=http://google.fr', {
                username: 'whatever',
                password: 'whatever'
            }, null);
            assert.equal(response.body, 'Unauthorized');
        });
    });

    afterEach(function* () {
        request.setToken();
    });

    after(function* () {
        yield fixtureLoader.clear();
    });
});
