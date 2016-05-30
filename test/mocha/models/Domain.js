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
            const user = yield fixtureLoader.createUser({ username: 'john', domains: ['inshs', 'insb']});
            const inshs = yield domainQueries.selectOneByName('inshs');
            const insb = yield domainQueries.selectOneByName('insb');
            assert.deepEqual(yield domainQueries.selectByUser(user), [{ ...inshs, totalcount: '2' }, { ...insb, totalcount: '2' }]);
        });
    });

    afterEach(function* () {
        yield fixtureLoader.clear();
    });

});
