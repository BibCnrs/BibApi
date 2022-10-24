describe('GET /ebsco/licenses', function () {
    let INC;
    let licenseOne;
    before(function* () {
        INC = yield fixtureLoader.createCommunity({
            name: 'INC',
            user_id: 'userIdINC',
            password: 'passwordINC',
            profile: 'profileINC',
        });

        licenseOne = yield fixtureLoader.createLicense({
            name_fr: 'Licence ONE',
            name_en: 'License ONE',
            content_fr: 'Contenu',
            content_en: 'Content',
            enable: true,
            license_community: [
                {
                    community_id: INC.id,
                },
            ],
        });

        yield fixtureLoader.createLicense({
            name_fr: 'Licence TWO',
            name_en: 'License TWO',
            content_fr: 'Contenu',
            content_en: 'Content',
            enable: true,
        });

        yield fixtureLoader.createJanusAccount({
            uid: 'john',
            communities: [INC.id],
        });
    });

    it('should return license for INC community', function* () {
        request.setToken({ username: 'john', domains: ['INC'] });
        const response = yield request.get('/ebsco/licenses?domains=INC');
        assert.deepEqual(JSON.parse(response.body), [
            {
                ...licenseOne,
                license_community: [
                    {
                        community: INC,
                        community_id: INC.id,
                        license_id: licenseOne.id,
                    },
                ],
            },
        ]);
    });

    after(function* () {
        yield fixtureLoader.clear();
    });
});
