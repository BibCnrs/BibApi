import Domain from '../../../lib/models/Domain';

describe('model Domain', function () {
    let domainQueries;

    before(function () {
        domainQueries = Domain(postgres);
    });

    describe('selectByName', function () {

        it('should return each domain with given names', function* () {
            const [ insb, inshs, , inc] = yield ['insb', 'inshs', 'in2p3', 'inc']
            .map(name => fixtureLoader.createDomain({ name }));

            assert.deepEqual(yield domainQueries.selectByName(['insb', 'inshs', 'inc']), [
                {
                    ...inc,
                    totalcount: '3'
                }, {
                    ...insb,
                    totalcount: '3'
                }, {
                    ...inshs,
                    totalcount: '3'
                }]);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectOneByName', function () {

        it('should return domain for given name', function* () {
            const inshs = yield fixtureLoader.createDomain({ name: 'inshs' });
            assert.deepEqual(yield domainQueries.selectOneByName('inshs'), inshs);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectByUserQuery', function () {
        it('should return domain of user', function* () {
            const [insb, inshs, inc] = yield ['insb', 'inshs', 'inc']
            .map(name => fixtureLoader.createDomain({ name, gate: name }));
            const john = yield fixtureLoader.createUser({ username: 'john', domains: ['inshs', 'insb']});
            const jane = yield fixtureLoader.createUser({ username: 'jane', domains: ['inshs', 'inc']});
            assert.deepEqual(yield domainQueries.selectByUser(john), [
                { ...insb, totalcount: '2', bib_user_id: john.id },
                { ...inshs, totalcount: '2', bib_user_id: john.id }
            ]);
            assert.deepEqual(yield domainQueries.selectByUser(jane), [
                { ...inc, totalcount: '2', bib_user_id: jane.id },
                { ...inshs, totalcount: '2', bib_user_id: jane.id }
            ]);
        });
    });

    afterEach(function* () {
        yield fixtureLoader.clear();
    });

});
