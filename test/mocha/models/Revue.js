import { getRevuesByDomains } from '../../../lib/models/Revue';

describe('model Revue', function () {
    describe('getRevuesByDomains', function () {
        beforeEach(function* () {
            const [insb, inshs, inp] = yield ['INSB', 'INSHS', 'INP'].map(
                (name) =>
                    fixtureLoader.createCommunity({
                        name,
                        gate: name.toLowerCase(),
                    }),
            );

            yield [insb, inshs].map((community) =>
                fixtureLoader.createRevue({
                    title: `Revue ${community.name}`,
                    url: `http://www.${community.name}.com`,
                    communities: [community.id, inp.id],
                }),
            );
        });

        it('should return revue for given domains', function* () {
            assert.deepEqual(yield getRevuesByDomains(['INSB']), [
                {
                    title: 'Revue INSB',
                    url: 'http://insb.bib.cnrs.fr/login?url=http://www.INSB.com',
                },
            ]);
            assert.deepEqual(yield getRevuesByDomains(['INSHS']), [
                {
                    title: 'Revue INSHS',
                    url: 'http://inshs.bib.cnrs.fr/login?url=http://www.INSHS.com',
                },
            ]);
        });

        it('domain order should change result order', function* () {
            assert.deepEqual(yield getRevuesByDomains(['INSB', 'INSHS']), [
                {
                    title: 'Revue INSB',
                    url: 'http://insb.bib.cnrs.fr/login?url=http://www.INSB.com',
                },
                {
                    title: 'Revue INSHS',
                    url: 'http://inshs.bib.cnrs.fr/login?url=http://www.INSHS.com',
                },
            ]);
            assert.deepEqual(yield getRevuesByDomains(['INSHS', 'INSB']), [
                {
                    title: 'Revue INSHS',
                    url: 'http://inshs.bib.cnrs.fr/login?url=http://www.INSHS.com',
                },
                {
                    title: 'Revue INSB',
                    url: 'http://insb.bib.cnrs.fr/login?url=http://www.INSB.com',
                },
            ]);
        });

        it('duplicate should be removed and first matching community gate applied', function* () {
            assert.deepEqual(
                yield getRevuesByDomains(['INSB', 'INSHS', 'INP']),
                [
                    {
                        title: 'Revue INSB',
                        url: 'http://insb.bib.cnrs.fr/login?url=http://www.INSB.com',
                    },
                    {
                        title: 'Revue INSHS',
                        url: 'http://inshs.bib.cnrs.fr/login?url=http://www.INSHS.com',
                    },
                ],
            );
            assert.deepEqual(
                yield getRevuesByDomains(['INP', 'INSB', 'INSHS']),
                [
                    {
                        title: 'Revue INSB',
                        url: 'http://inp.bib.cnrs.fr/login?url=http://www.INSB.com',
                    },
                    {
                        title: 'Revue INSHS',
                        url: 'http://inp.bib.cnrs.fr/login?url=http://www.INSHS.com',
                    },
                ],
            );
        });

        it('should return revue for given domains applying gate based on requested domain', function* () {
            assert.deepEqual(yield getRevuesByDomains(['INP']), [
                {
                    title: 'Revue INSB',
                    url: 'http://inp.bib.cnrs.fr/login?url=http://www.INSB.com',
                },
                {
                    title: 'Revue INSHS',
                    url: 'http://inp.bib.cnrs.fr/login?url=http://www.INSHS.com',
                },
            ]);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });
});
