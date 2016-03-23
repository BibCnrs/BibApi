describe('/ezticket', function () {
    let user;

    before(function* () {
        yield fixtureLoader.createDomain({ name: 'vie', gate: 'insb' });
        yield fixtureLoader.createDomain({ name: 'shs', gate: 'inshs' });
        user = yield fixtureLoader.createUser({ username: 'johnny', password: 'secret', domains: ['vie', 'shs'] });
    });

    it('should redirect to ezticket/login', function* () {
        const error = yield request.get('/ezticket?gate=gate.test.com&url=google.fr').catch(error => error);
        assert.equal(error.message, '302 - Redirecting to <a href="ezticket/login?gate=gate.test.com&amp;url=google.fr">ezticket/login?gate=gate.test.com&amp;url=google.fr</a>.');
    });

    it('should redirect to ezticket/login when token is wrong', function* () {
        const error = yield request.get('/ezticket?gate=gate.test.com&url=google.fr', 'wrong token').catch(error => error);
        assert.equal(error.message, '302 - Redirecting to <a href="ezticket/login?gate=gate.test.com&amp;url=google.fr">ezticket/login?gate=gate.test.com&amp;url=google.fr</a>.');
    });

    it('should redirect to generated url when posting /login with correct username and password', function* () {
        const error = yield request.post('/ezticket/login?gate=gate.test.com&url=http://google.fr', { username: user.username, password: user.password }).catch(error => error);
        assert.match(error.message, /302 - Redirecting to\s+http:\/\/gate\.test\.com\/login\?user=johnny.*?%24ginsb%2Binshs/);
    });

    it('should redirect to generated url when correct authorization header is present', function* () {
        const token = (yield request.post('/ebsco/login', {
            username: user.username,
            password: user.password
        }, null)).token;
        const error = yield request.get('/ezticket?gate=gate.test.com&url=http://google.fr', token).catch(error => error);
        assert.match(error.message, /302 - Redirecting to.*?http:\/\/gate\.test\.com\/login\?user=johnny.*?%24ginsb%2Binshs/);
    });

    after(function* () {
        yield fixtureLoader.clear();
    });
});
