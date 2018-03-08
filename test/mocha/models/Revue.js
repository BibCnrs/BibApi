import Revue from '../../../lib/models/Revue';

describe('model Revue', function() {
    let revueQueries;

    before(function() {
        revueQueries = Revue(postgres);
    });

    describe('selectRevueByDomains', function() {
        beforeEach(function*() {
            const [insb, inshs, inp] = yield ['INSB', 'INSHS', 'INP'].map(
                name =>
                    fixtureLoader.createCommunity({
                        name,
                        gate: name.toLowerCase(),
                    }),
            );

            yield [insb, inshs].map(community =>
                fixtureLoader.createRevue({
                    title: `Revue ${community.name}`,
                    url: `http://www.${community.name}.com`,
                    communities: [community.id, inp.id],
                }),
            );
        });

        it('should return revue for given domains', function*() {
            assert.deepEqual(
                yield revueQueries.selectRevueByDomains(['INSB']),
                [
                    {
                        title: 'Revue INSB',
                        url:
                            'http://insb.bib.cnrs.fr/login?url=http%3A%2F%2Fwww.INSB.com',
                    },
                ],
            );
            assert.deepEqual(
                yield revueQueries.selectRevueByDomains(['INSHS']),
                [
                    {
                        title: 'Revue INSHS',
                        url:
                            'http://inshs.bib.cnrs.fr/login?url=http%3A%2F%2Fwww.INSHS.com',
                    },
                ],
            );
        });

        it('domain order should change result order', function*() {
            assert.deepEqual(
                yield revueQueries.selectRevueByDomains(['INSB', 'INSHS']),
                [
                    {
                        title: 'Revue INSB',
                        url:
                            'http://insb.bib.cnrs.fr/login?url=http%3A%2F%2Fwww.INSB.com',
                    },
                    {
                        title: 'Revue INSHS',
                        url:
                            'http://inshs.bib.cnrs.fr/login?url=http%3A%2F%2Fwww.INSHS.com',
                    },
                ],
            );
            assert.deepEqual(
                yield revueQueries.selectRevueByDomains(['INSHS', 'INSB']),
                [
                    {
                        title: 'Revue INSHS',
                        url:
                            'http://inshs.bib.cnrs.fr/login?url=http%3A%2F%2Fwww.INSHS.com',
                    },
                    {
                        title: 'Revue INSB',
                        url:
                            'http://insb.bib.cnrs.fr/login?url=http%3A%2F%2Fwww.INSB.com',
                    },
                ],
            );
        });

        it('duplicate should be removed and first matching community gate applied', function*() {
            assert.deepEqual(
                yield revueQueries.selectRevueByDomains([
                    'INSB',
                    'INSHS',
                    'INP',
                ]),
                [
                    {
                        title: 'Revue INSB',
                        url:
                            'http://insb.bib.cnrs.fr/login?url=http%3A%2F%2Fwww.INSB.com',
                    },
                    {
                        title: 'Revue INSHS',
                        url:
                            'http://inshs.bib.cnrs.fr/login?url=http%3A%2F%2Fwww.INSHS.com',
                    },
                ],
            );
            assert.deepEqual(
                yield revueQueries.selectRevueByDomains([
                    'INP',
                    'INSB',
                    'INSHS',
                ]),
                [
                    {
                        title: 'Revue INSB',
                        url:
                            'http://inp.bib.cnrs.fr/login?url=http%3A%2F%2Fwww.INSB.com',
                    },
                    {
                        title: 'Revue INSHS',
                        url:
                            'http://inp.bib.cnrs.fr/login?url=http%3A%2F%2Fwww.INSHS.com',
                    },
                ],
            );
        });

        it('should return revue for given domains applying gate based on requested domain', function*() {
            assert.deepEqual(yield revueQueries.selectRevueByDomains(['INP']), [
                {
                    title: 'Revue INSB',
                    url:
                        'http://inp.bib.cnrs.fr/login?url=http%3A%2F%2Fwww.INSB.com',
                },
                {
                    title: 'Revue INSHS',
                    url:
                        'http://inp.bib.cnrs.fr/login?url=http%3A%2F%2Fwww.INSHS.com',
                },
            ]);
        });

        afterEach(function*() {
            yield fixtureLoader.clear();
        });
    });
});
