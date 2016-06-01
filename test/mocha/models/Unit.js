import Unit from '../../../lib/models/Unit';
import Domain from '../../../lib/models/Domain';

describe('model Unit', function () {
    let unitQueries, domainQueries;

    before(function () {
        unitQueries = Unit(postgres);
        domainQueries = Domain(postgres);
    });

    describe('selectOne', function () {
        let unit;

        before(function* () {
            yield fixtureLoader.createDomain({ name: 'vie', gate: 'insb'});
            yield fixtureLoader.createDomain({ name: 'shs', gate: 'inshs'});
            yield fixtureLoader.createDomain({ name: 'nuclear', gate: 'in2p3'});
            yield fixtureLoader.createDomain({ name: 'universe', gate: 'insu'});
            unit = yield fixtureLoader.createUnit({ name: 'biology', domains: ['vie', 'shs']});
        });

        it ('should return one unit by id', function* () {

            assert.deepEqual(yield unitQueries.selectOne({ id: unit.id }), {
                id: unit.id,
                name: 'biology',
                comment: null,
                domains: ['shs', 'vie']
            });
        });

        after(function* () {
            yield fixtureLoader.clear();
        });

    });

    describe('selectPage', function () {
        let biology, chemestry, humanity;
        before(function* () {
            yield fixtureLoader.createDomain({ name: 'vie', gate: 'insb'});
            yield fixtureLoader.createDomain({ name: 'shs', gate: 'inshs'});
            yield fixtureLoader.createDomain({ name: 'universe', gate: 'insu'});
            yield fixtureLoader.createDomain({ name: 'nuclear', gate: 'in2p3'});
            chemestry = yield fixtureLoader.createUnit({ name: 'chemestry', domains: ['vie', 'shs']});
            biology = yield fixtureLoader.createUnit({ name: 'biology', domains: ['vie', 'nuclear']});
            humanity = yield fixtureLoader.createUnit({ name: 'humanity', domains: ['universe', 'nuclear']});
        });

        it ('should return one unit by id', function* () {

            assert.deepEqual(yield unitQueries.selectPage(), [
                {
                    id: chemestry.id,
                    totalcount: '3',
                    name: 'chemestry',
                    comment: null,
                    domains: ['shs', 'vie']
                }, {
                    id: biology.id,
                    totalcount: '3',
                    name: 'biology',
                    comment: null,
                    domains: ['nuclear', 'vie']
                }, {
                    id: humanity.id,
                    totalcount: '3',
                    name: 'humanity',
                    comment: null,
                    domains: ['nuclear', 'universe']
                }
            ]);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });

    });

    describe('updateOne', function () {
        let unit, insb, inc, inshs;

        beforeEach(function* () {
            [insb, inc, inshs] = yield ['insb', 'inc', 'inshs']
            .map(name => fixtureLoader.createDomain({ name }));

            unit = yield fixtureLoader.createUnit({ name: 'biology', domains: ['insb', 'inc']});
        });

        it('should throw an error if trying to add a domain which does not exists and abort modification', function* () {
            let error;
            try {
                yield unitQueries.updateOne(unit.id, { domains: ['nemo', 'inshs'] });
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Domains nemo does not exists');
            const unitDomains = yield domainQueries.selectByUnitId(unit.id);
            assert.deepEqual(unitDomains, [inc, insb].map(d => ({ ...d, totalcount: '2', unit_id: unit.id })));
        });

        it('should add given new domain', function* () {
            yield unitQueries.updateOne(unit.id, { domains: ['insb', 'inc', 'inshs'] });

            const unitDomains = yield domainQueries.selectByUnitId(unit.id);
            assert.deepEqual(unitDomains, [inc, insb, inshs].map(d => ({ ...d, totalcount: '3', unit_id: unit.id })));
        });

        it('should remove missing domain', function* () {
            yield unitQueries.updateOne(unit.id, { domains: ['insb'] });

            const unitDomains = yield domainQueries.selectByUnitId(unit.id);
            assert.deepEqual(unitDomains, [insb].map(d => ({ ...d, totalcount: '1', unit_id: unit.id })));
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('insertOne', function () {
        let insb, inc;

        beforeEach(function* () {
            [insb, inc] = yield ['insb', 'inc']
            .map(name => fixtureLoader.createDomain({ name }));
        });

        it('should add given domains if they exists', function* () {
            const unit = yield unitQueries.insertOne({ name: 'biology', domains: ['insb', 'inc'] });

            const unitDomains = yield domainQueries.selectByUnitId(unit.id);
            assert.deepEqual(unitDomains, [inc, insb].map(domain => ({ ...domain, totalcount: '2', unit_id: unit.id })));
        });

        it('should throw an error if trying to insert an unit with domain that do not exists', function* () {
            let error;
            try {
                yield unitQueries.insertOne({ name: 'biology', domains: ['insb', 'nemo'] });
            } catch (e) {
                error = e;
            }
            assert.equal(error.message, 'Domains nemo does not exists');

            const insertedunit = yield postgres.queryOne({sql: 'SELECT * from unit WHERE name=$name', parameters: { name: 'biology'} });
            assert.isUndefined(insertedunit);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('upsertOnePerName', function () {
        it('should create a new unit if none exists with the same code', function* () {
            const unit = yield unitQueries.upsertOnePerName({ name: 'biology', comment: 'some comment' });
            assert.deepEqual(unit, {
                id: unit.id,
                name: 'biology',
                comment: 'some comment'
            });

            const insertedUnit = yield postgres.queryOne({sql: 'SELECT * from unit WHERE name=$name', parameters: { name: 'biology'} });
            assert.deepEqual(insertedUnit, unit);
        });

        it('should update existing institute with the same code', function* () {
            const previousUnit = yield fixtureLoader.createUnit({ name: 'biology', comment: 'some comment' });
            const unit = yield unitQueries.upsertOnePerName({ name: 'biology', comment: 'updated comment' });
            assert.deepEqual(unit, {
                id: unit.id,
                name: 'biology',
                comment: 'updated comment'
            });

            const updatedUnit = yield postgres.queryOne({sql: 'SELECT * from unit WHERE id=$id', parameters: { id: previousUnit.id } });
            assert.deepEqual(updatedUnit, unit);
            assert.notDeepEqual(updatedUnit, previousUnit);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectByIds', function () {
        let cern, inist;

        before(function*  () {
            [cern, inist] = yield ['cern', 'insit', 'marmelab']
            .map(name => fixtureLoader.createUnit({ name }));
        });

        it('should return each institute with given ids', function* () {
            assert.deepEqual(yield unitQueries.selectByIds([cern.id, inist.id]), [
                {
                    id: cern.id,
                    name: cern.name,
                    totalcount: '2'
                }, {
                    id: inist.id,
                    name: inist.name,
                    totalcount: '2'
                }
            ]);

        });

        it('should throw an error if trying to retrieve an unit that does not exists', function* () {
            let error;

            try {
                yield unitQueries.selectByIds([cern.id, inist.id, 0]);
            } catch(e) {
                error = e;
            }
            assert.equal(error.message, 'Units 0 does not exists');
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectByUserIdQuery', function () {
        it('should return additional_units of user', function* () {

            const [cern, inist, marmelab] = yield ['cern', 'inist', 'marmelab']
            .map(name => fixtureLoader.createUnit({ name }));

            const john = yield fixtureLoader.createUser({ username: 'john', additional_units: [cern.id, inist.id]});
            const jane = yield fixtureLoader.createUser({ username: 'jane', additional_units: [inist.id, marmelab.id]});
            assert.deepEqual(yield unitQueries.selectByUserId(john.id), [
                {
                    id: cern.id,
                    name: cern.name,
                    totalcount: '2',
                    bib_user_id: john.id
                },
                {
                    id: inist.id,
                    name: inist.name,
                    totalcount: '2',
                    bib_user_id: john.id
                }
            ]);
            assert.deepEqual(yield unitQueries.selectByUserId(jane.id), [
                {
                    id: inist.id,
                    name: inist.name,
                    totalcount: '2',
                    bib_user_id: jane.id
                },
                {
                    id: marmelab.id,
                    name: marmelab.name,
                    totalcount: '2',
                    bib_user_id: jane.id
                }
            ]);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

});
