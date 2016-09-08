describe('/ezticket', function () {
    let inistAccount, janusAccount, unauthorizedUser;

    before(function* () {
        yield fixtureLoader.createDomain({ name: 'vie', gate: 'insb' });
        yield fixtureLoader.createDomain({ name: 'shs', gate: 'inshs' });
        yield fixtureLoader.createDomain({ name: 'inc', gate: 'inc' });
        yield fixtureLoader.createDomain({ name: 'reaxys', gate: 'reaxys', ebsco: false });

        const { id: instituteId } = yield fixtureLoader.createInstitute({ code: 'institute', name: 'name' });
        const { id: unitId } = yield fixtureLoader.createUnit({ code: 'unit', name: 'name' });

        inistAccount = yield fixtureLoader.createInistAccount({
            username: 'johnny',
            password: 'secret',
            domains: ['vie', 'shs', 'reaxys'],
            main_institute: instituteId,
            main_unit: unitId
        });
        janusAccount = yield fixtureLoader.createJanusAccount({
            mail: 'johnny@inist.fr',
            password: 'secret',
            domains: ['vie', 'shs', 'reaxys'],
            primary_institute: instituteId,
            primary_unit: unitId
        });
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

    it('should redirect to generated url when correct inist cookie is present', function* () {
        request.setToken({ id: inistAccount.id, origin: 'inist', username: inistAccount.username, domains: ['vie', 'shs'], all_groups: ['insb', 'inshs'] });

        const response = yield request.get('/ezticket?gate=insb.test.com&url=http://google.fr');
        assert.match(response.body, /Redirecting to.*?http:\/\/insb\.test\.com\/login\?user=johnny.*?%24ginsb%2Binshs%2Breaxys%2BO_CNRS%2BOU_unit%2BI_institute/);
    });

    it('should redirect to generated url when correct janus cookie is present', function* () {
        request.setToken({ id: janusAccount.id, origin: 'janus', username: janusAccount.mail, domains: ['vie', 'shs'], all_groups: ['insb', 'inshs'] });

        const response = yield request.get('/ezticket?gate=insb.test.com&url=http://google.fr');
        assert.match(response.body, /Redirecting to.*?http:\/\/insb\.test\.com\/login\?user=johnny%40inist\.fr.*?%24ginsb%2Binshs%2Breaxys%2BO_CNRS%2BOU_unit%2BI_institute/);
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

            assert.match(response.body, /http:\/\/insb\.test\.com\/login\?user=johnny.*?%24ginsb%2Binshs%2Breaxys/);
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

    afterEach(function () {
        request.setToken();
    });

    after(function* () {
        yield fixtureLoader.clear();
    });
});
