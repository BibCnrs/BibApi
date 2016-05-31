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
                domains: ['vie', 'shs']
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
                    domains: ['shs', 'vie']
                }, {
                    id: biology.id,
                    totalcount: '3',
                    name: 'biology',
                    domains: ['nuclear', 'vie']
                }, {
                    id: humanity.id,
                    totalcount: '3',
                    name: 'humanity',
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
            const unitDomains = yield domainQueries.selectByUnit(unit);
            assert.deepEqual(unitDomains, [inc, insb].map(d => ({ ...d, totalcount: '2', unit_id: unit.id })));
        });

        it('should add given new domain', function* () {
            yield unitQueries.updateOne(unit.id, { domains: ['insb', 'inc', 'inshs'] });

            const unitDomains = yield domainQueries.selectByUnit(unit);
            assert.deepEqual(unitDomains, [inc, insb, inshs].map(d => ({ ...d, totalcount: '3', unit_id: unit.id })));
        });

        it('should remove missing domain', function* () {
            yield unitQueries.updateOne(unit.id, { domains: ['insb'] });

            const unitDomains = yield domainQueries.selectByUnit(unit);
            assert.deepEqual(unitDomains, [insb].map(d => ({ ...d, totalcount: '1', unit_id: unit.id })));
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

            const unitDomains = yield domainQueries.selectByUnit(unit);
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
    });

    describe('upsertOnePerName', function () {
        it('should create a new institute if none exists with the same code', function* () {
            const institute = yield unitQueries.upsertOnePerName({ name: 'biology', comment: 'some comment' });
            assert.deepEqual(institute, {
                id: institute.id,
                name: 'biology',
                comment: 'some comment'
            });

            const insertedInstitute = yield postgres.queryOne({sql: 'SELECT * from unit WHERE name=$name', parameters: { name: 'biology'} });
            assert.deepEqual(insertedInstitute, institute);
        });

        it('should update existing institute with the same code', function* () {
            const previousInstitute = yield fixtureLoader.createUnit({ name: 'biology', comment: 'some comment' });
            const institute = yield unitQueries.upsertOnePerName({ name: 'biology', comment: 'updated comment' });
            assert.deepEqual(institute, {
                id: institute.id,
                name: 'biology',
                comment: 'updated comment'
            });

            const updatedInstitute = yield postgres.queryOne({sql: 'SELECT * from unit WHERE id=$id', parameters: { id: previousInstitute.id } });
            assert.deepEqual(updatedInstitute, institute);
            assert.notDeepEqual(updatedInstitute, previousInstitute);
        });
    });

    afterEach(function* () {
        yield fixtureLoader.clear();
    });

});
