describe('/ezticket', function () {
    let user;

    beforeEach(function* () {
        user = yield fixtureLoader.createUser({ username: 'johnny', password: 'secret', domains: ['vie', 'shs'] });
    });

    it('should redirect to ezticket/login', function* () {
        const error = yield request.get('/ezticket?url=google.fr').catch(error => error);
        assert.equal(error.message, '302 - Redirecting to <a href="ezticket/login?url=google.fr">ezticket/login?url=google.fr</a>.');
    });

    it('should redirect to ezticket/login when token is wrong', function* () {
        const error = yield request.get('/ezticket?url=google.fr', 'wrong token').catch(error => error);
        assert.equal(error.message, '302 - Redirecting to <a href="ezticket/login?url=google.fr">ezticket/login?url=google.fr</a>.');
    });

    it('should redirect to generated url when posting /login with correct username and password', function* () {
        const error = yield request.post('/ezticket/login?url=http://google.fr', { username: user.username, password: user.password }).catch(error => error);
        assert.match(error.message, /302 - Redirecting to\s+http:\/\/ezproxy\/login\?user=johnny/);
    });

    it('should redirect to generated url when correct authorization header is present', function* () {
        const token = (yield request.post('/ebsco/login', {
            username: user.username,
            password: user.password
        }, null)).token;
        const error = yield request.get('/ezticket?url=http://google.fr', token).catch(error => error);
        assert.match(error.message, /302 - Redirecting to.*?http:\/\/ezproxy\/login\?user=johnny/);
    });

    afterEach(function* () {
        yield fixtureLoader.clear();
    });
});
