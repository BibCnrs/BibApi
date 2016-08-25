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

            assert.deepEqual(yield domainQueries.selectByNames(['insb', 'inshs', 'inc']), [
                {
                    ...insb
                }, {
                    ...inshs
                }, {
                    ...inc
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

    describe('selectByJanusAccountIdQuery', function () {
        it('should return domain of user', function* () {
            const [insb, inshs, inc] = yield ['insb', 'inshs', 'inc']
            .map(name => fixtureLoader.createDomain({ name, gate: name }));
            const john = yield fixtureLoader.createJanusAccount({ uid: 'john', domains: ['insb', 'inshs']});
            const jane = yield fixtureLoader.createJanusAccount({ uid: 'jane', domains: ['inc', 'inshs']});
            assert.deepEqual(yield domainQueries.selectByJanusAccountId(john.id), [
                { ...insb, totalcount: '2', index: 0, janus_account_id: john.id },
                { ...inshs, totalcount: '2', index: 1, janus_account_id: john.id }
            ]);
            assert.deepEqual(yield domainQueries.selectByJanusAccountId(jane.id), [
                { ...inc, totalcount: '2', index: 0, janus_account_id: jane.id },
                { ...inshs, totalcount: '2', index: 1, janus_account_id: jane.id }
            ]);
        });
    });

    describe('selectByInistAccountIdQuery', function () {
        it('should return domain of inistAccount', function* () {
            const [insb, inshs, inc] = yield ['insb', 'inshs', 'inc']
            .map(name => fixtureLoader.createDomain({ name, gate: name }));
            const john = yield fixtureLoader.createInistAccount({ username: 'john', domains: ['insb', 'inshs']});
            const jane = yield fixtureLoader.createInistAccount({ username: 'jane', domains: ['inc', 'inshs']});
            assert.deepEqual(yield domainQueries.selectByInistAccountId(john.id), [
                { ...insb, totalcount: '2', index: 0, inist_account_id: john.id },
                { ...inshs, totalcount: '2', index: 1, inist_account_id: john.id }
            ]);
            assert.deepEqual(yield domainQueries.selectByInistAccountId(jane.id), [
                { ...inc, totalcount: '2', index: 0, inist_account_id: jane.id },
                { ...inshs, totalcount: '2', index: 1, inist_account_id: jane.id }
            ]);
        });
    });

    describe('selectByInstituteIdQuery', function () {
        it('should return domain of institute', function* () {
            const [insb, inshs, inc] = yield ['insb', 'inshs', 'inc']
            .map(name => fixtureLoader.createDomain({ name, gate: name }));
            const biology = yield fixtureLoader.createInstitute({ name: 'biology', code: 'insb', domains: ['insb', 'inshs']});
            const human = yield fixtureLoader.createInstitute({ username: 'human science', code: 'inshs', domains: ['inc', 'inshs']});
            assert.deepEqual(yield domainQueries.selectByInstituteId(biology.id), [
                { ...insb, totalcount: '2', index: 0, institute_id: biology.id },
                { ...inshs, totalcount: '2', index: 1, institute_id: biology.id }
            ]);
            assert.deepEqual(yield domainQueries.selectByInstituteId(human.id), [
                { ...inc, totalcount: '2', index: 0, institute_id: human.id },
                { ...inshs, totalcount: '2', index: 1, institute_id: human.id }
            ]);
        });
    });

    describe('selectByUnitIdQuery', function () {
        it('should return domain of unit', function* () {
            const [insb, inshs, inc] = yield ['insb', 'inshs', 'inc']
            .map(name => fixtureLoader.createDomain({ name, gate: name }));
            const biology = yield fixtureLoader.createUnit({ code: 'biology', domains: ['inshs', 'insb']});
            const human = yield fixtureLoader.createUnit({ code: 'human science', domains: ['inshs', 'inc']});
            assert.deepEqual(yield domainQueries.selectByUnitId(biology.id), [
                { ...inshs, totalcount: '2', index: 0, unit_id: biology.id },
                { ...insb, totalcount: '2', index: 1, unit_id: biology.id }
            ]);
            assert.deepEqual(yield domainQueries.selectByUnitId(human.id), [
                { ...inshs, totalcount: '2', index: 0, unit_id: human.id },
                { ...inc, totalcount: '2', index: 1, unit_id: human.id }
            ]);
        });
    });

    afterEach(function* () {
        yield fixtureLoader.clear();
    });

});
