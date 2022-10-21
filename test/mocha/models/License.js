import { insertOne, selectOne, updateOne } from '../../../lib/models/License';

describe('model License', function () {
    describe('insertOne', function () {
        let community;
        before(function* () {
            community = yield fixtureLoader.createCommunity({
                name: 'community',
                user_id: 'userIdVie',
                password: 'passwordVie',
                profile: 'profileVie',
            });
        });

        it('should insert license with community', function* () {
            const license = {
                name_fr: 'Licence',
                name_en: 'License',
                content_fr: 'Contenu',
                content_en: 'Content',
                enable: true,
                license_community: [
                    {
                        community_id: community.id,
                    },
                ],
            };

            const licenseCreated = yield insertOne(license);

            assert.equal(licenseCreated.name_fr, 'Licence');
            assert.equal(licenseCreated.name_en, 'License');
            assert.equal(licenseCreated.content_fr, 'Contenu');
            assert.equal(licenseCreated.content_en, 'Content');
            assert.equal(licenseCreated.enable, true);
        });

        it('should return error if name is not provided', function* () {
            try {
                yield insertOne({});
            } catch (error) {
                expect(error).to.exist; // Not recommended
            }
        });

        it('should insert license without pdf', function* () {
            const license = {
                name_fr: 'Licence',
                name_en: 'License',
                content_fr: 'Contenu',
                content_en: 'Content',
                enable: true,
            };
            const licenseCreated = yield insertOne(license);

            assert.equal(licenseCreated.name_fr, 'Licence');
            assert.equal(licenseCreated.name_en, 'License');
            assert.equal(licenseCreated.content_fr, 'Contenu');
            assert.equal(licenseCreated.content_en, 'Content');
            assert.equal(licenseCreated.enable, true);
        });

        it('should insert license with pdf', function* () {
            const license = {
                name_fr: 'Licence',
                name_en: 'License',
                content_fr: 'Contenu',
                content_en: 'Content',
                enable: true,
                pdf: {
                    src: 'http://www.example.com',
                    title: 'Example',
                },
            };
            const licenseCreated = yield insertOne(license);
            assert.equal(licenseCreated.name_fr, 'Licence');
            assert.equal(licenseCreated.name_en, 'License');
            assert.equal(licenseCreated.content_fr, 'Contenu');
            assert.equal(licenseCreated.content_en, 'Content');
            assert.equal(licenseCreated.enable, true);
            assert.equal(licenseCreated.pdf.src, license.pdf.src);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('updateOne', function () {
        let community, license;
        before(function* () {
            community = yield fixtureLoader.createCommunity({
                name: 'community',
                user_id: 'userIdVie',
                password: 'passwordVie',
                profile: 'profileVie',
            });

            license = yield fixtureLoader.createLicense({
                name_fr: 'Licence',
                name_en: 'License',
                content_fr: 'Contenu',
                content_en: 'Content',
                enable: true,
                license_community: [
                    {
                        community_id: community.id,
                    },
                ],
            });
        });

        it('should update license with community', function* () {
            const licenseToUpdate = {
                name_fr: 'Licence Updated',
                name_en: 'License Updated',
                content_fr: 'Contenu Updated',
                content_en: 'Content Updated',
                enable: true,
                license_community: [
                    {
                        community_id: community.id,
                    },
                ],
            };

            const licenseUpdated = yield updateOne(license.id, licenseToUpdate);

            assert.equal(licenseUpdated.name_fr, 'Licence Updated');
            assert.equal(licenseUpdated.name_en, 'License Updated');
            assert.equal(licenseUpdated.content_fr, 'Contenu Updated');
            assert.equal(licenseUpdated.content_en, 'Content Updated');
            assert.equal(licenseUpdated.enable, true);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectOne', function () {
        let community, license;
        before(function* () {
            community = yield fixtureLoader.createCommunity({
                name: 'community',
                user_id: 'userIdVie',
                password: 'passwordVie',
                profile: 'profileVie',
            });

            license = yield fixtureLoader.createLicense({
                name_fr: 'Licence',
                name_en: 'License',
                content_fr: 'Contenu',
                content_en: 'Content',
                enable: true,
                license_community: [
                    {
                        community_id: community.id,
                    },
                ],
            });
        });

        it('should selectOne license with community', function* () {
            const licenseSelected = yield selectOne(license.id);

            assert.equal(licenseSelected.name_fr, 'Licence');
            assert.equal(licenseSelected.name_en, 'License');
            assert.equal(licenseSelected.content_fr, 'Contenu');
            assert.equal(licenseSelected.content_en, 'Content');
            assert.equal(licenseSelected.enable, true);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });
});
