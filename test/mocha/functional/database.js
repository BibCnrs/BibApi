describe('GET /ebsco/database', function () {
    let cnrs;
    let inist;
    let insb;
    let marmelab;
    before(function* () {
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

        marmelab = yield fixtureLoader.createDatabase({
            name_fr: 'marmelab',
            name_en: 'marmelab US',
            communities: [vie.id, shs.id],
        });
        marmelab = {
            ...marmelab,
            communities: [vie.id, shs.id],
            domains: [vie.name, shs.name],
            totalcount: '4',
        };

        cnrs = yield fixtureLoader.createDatabase({
            name_fr: 'cnrs',
            name_en: 'cnrs US',
            communities: [shs.id],
        });
        cnrs = {
            ...cnrs,
            communities: [shs.id],
            domains: [shs.name],
            totalcount: '4',
        };

        inist = yield fixtureLoader.createDatabase({
            name_fr: 'inist',
            name_en: 'inist US',
            communities: [vie.id],
        });
        inist = {
            ...inist,
            communities: [vie.id],
            domains: [vie.name],
            totalcount: '4',
        };

        insb = yield fixtureLoader.createDatabase({
            name_fr: 'insb',
            name_en: 'insb US',
            communities: [vie.id],
        });
        insb = {
            ...insb,
            communities: [vie.id],
            domains: [vie.name],
            totalcount: '4',
        };
    });

    it('should return username, domains from cookie_token and header_token saved in redis in cookie_token shib key and delete it from redis', function* () {
        const response = yield request.get('/ebsco/databases');
        assert.deepEqual(JSON.parse(response.body), [
            marmelab,
            cnrs,
            inist,
            insb,
        ]);
    });

    after(function* () {
        yield fixtureLoader.clear();
    });
});
