describe('/ezticket', function () {
    let inistAccount, janusAccount, unauthorizedUser;

    before(function* () {
        const vie = yield fixtureLoader.createCommunity({ name: 'vie', gate: 'insb' });
        const shs = yield fixtureLoader.createCommunity({ name: 'shs', gate: 'inshs' });
        yield fixtureLoader.createCommunity({ name: 'inc', gate: 'inc' });
        const reaxys = yield fixtureLoader.createCommunity({ name: 'reaxys', gate: 'reaxys', ebsco: false });

        const { id: instituteId } = yield fixtureLoader.createInstitute({ code: 'institute', name: 'name' });
        const { id: unitId } = yield fixtureLoader.createUnit({ code: 'unit', name: 'name' });

        inistAccount = yield fixtureLoader.createInistAccount({
            username: 'johnny',
            password: 'secret',
            communities: [vie.id, shs.id, reaxys.id],
            main_institute: instituteId,
            main_unit: unitId
        });
        janusAccount = yield fixtureLoader.createJanusAccount({
            mail: 'johnny@inist.fr',
            password: 'secret',
            communities: [vie.id, shs.id, reaxys.id],
            primary_institute: instituteId,
            primary_unit: unitId
        });
        unauthorizedUser = yield fixtureLoader.createInistAccount({ username: 'jane', password: 'secret', communities: [shs.id] });
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
        request.setToken({ id: inistAccount.id, origin: 'inist', username: inistAccount.username, domains: ['vie', 'shs'], groups: ['insb', 'inshs', 'reaxys'] });

        const response = yield request.get('/ezticket?gate=insb.test.com&url=http://google.fr');
        assert.match(response.body, /Redirecting to.*?http:\/\/insb\.test\.com\/login\?user=johnny_O_CNRS_I_institute_OU_unit.*?%24ginsb%2Binshs%2Breaxys/);
    });

    it('should redirect to generated url when correct janus cookie is present', function* () {
        request.setToken({ id: janusAccount.id, origin: 'janus', username: janusAccount.mail, domains: ['vie', 'shs'], groups: ['insb', 'inshs', 'reaxys'] });

        const response = yield request.get('/ezticket?gate=insb.test.com&url=http://google.fr');
        assert.match(response.body, /Redirecting to.*?http:\/\/insb\.test\.com\/login\?user=johnny%40inist\.fr_O_CNRS_I_institute_OU_unit.*?%24ginsb%2Binshs%2Breaxys/);
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
            assert.match(response.body, /You cannot access this resource because you are searching in a discipline which is not within your authorized discipline field/);
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
