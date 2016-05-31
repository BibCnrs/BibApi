import Institute from '../../../lib/models/Institute';
import Domain from '../../../lib/models/Domain';

describe('model Institute', function () {
    let instituteQueries, domainQueries;

    before(function () {
        instituteQueries = Institute(postgres);
        domainQueries = Domain(postgres);
    });

    describe('selectOne', function () {
        let institute;

        before(function* () {
            yield fixtureLoader.createDomain({ name: 'vie', gate: 'insb'});
            yield fixtureLoader.createDomain({ name: 'shs', gate: 'inshs'});
            yield fixtureLoader.createDomain({ name: 'nuclear', gate: 'in2p3'});
            yield fixtureLoader.createDomain({ name: 'universe', gate: 'insu'});
            institute = yield fixtureLoader.createInstitute({ name: 'biology', code: 'insb', domains: ['vie', 'shs']});
        });

        it ('should return one institute by id', function* () {

            assert.deepEqual(yield instituteQueries.selectOne({ id: institute.id }), {
                id: institute.id,
                name: 'biology',
                code: 'insb',
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
            chemestry = yield fixtureLoader.createInstitute({ name: 'chemestry', code: '52', domains: ['vie', 'shs']});
            biology = yield fixtureLoader.createInstitute({ name: 'biology', code: '53', domains: ['vie', 'nuclear']});
            humanity = yield fixtureLoader.createInstitute({ name: 'humanity', code: '54', domains: ['universe', 'nuclear']});
        });

        it ('should return one institute by id', function* () {

            assert.deepEqual(yield instituteQueries.selectPage(), [
                {
                    id: chemestry.id,
                    totalcount: '3',
                    name: 'chemestry',
                    code: '52',
                    domains: ['shs', 'vie']
                }, {
                    id: biology.id,
                    totalcount: '3',
                    name: 'biology',
                    code: '53',
                    domains: ['nuclear', 'vie']
                }, {
                    id: humanity.id,
                    totalcount: '3',
                    name: 'humanity',
                    code: '54',
                    domains: ['nuclear', 'universe']
                }
            ]);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });

    });

    describe('updateOne', function () {
        let institute, insb, inc, inshs;

        beforeEach(function* () {
            [insb, inc, inshs] = yield ['insb', 'inc', 'inshs']
            .map(name => fixtureLoader.createDomain({ name }));

            institute = yield fixtureLoader.createInstitute({ name: 'biology', domains: ['insb', 'inc']});
        });

        it('should throw an error if trying to add a domain which does not exists and abort modification', function* () {
            let error;
            try {
                yield instituteQueries.updateOne(institute.id, { domains: ['nemo', 'inshs'] });
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Domains nemo does not exists');
            const instituteDomains = yield domainQueries.selectByInstitute(institute);
            assert.deepEqual(instituteDomains, [inc, insb].map(d => ({ ...d, totalcount: '2', institute_id: institute.id })));
        });

        it('should add given new domain', function* () {
            yield instituteQueries.updateOne(institute.id, { domains: ['insb', 'inc', 'inshs'] });

            const instituteDomains = yield domainQueries.selectByInstitute(institute);
            assert.deepEqual(instituteDomains, [inc, insb, inshs].map(d => ({ ...d, totalcount: '3', institute_id: institute.id })));
        });

        it('should remove missing domain', function* () {
            yield instituteQueries.updateOne(institute.id, { domains: ['insb'] });

            const instituteDomains = yield domainQueries.selectByInstitute(institute);
            assert.deepEqual(instituteDomains, [insb].map(d => ({ ...d, totalcount: '1', institute_id: institute.id })));
        });
    });

    describe('insertOne', function () {
        let insb, inc;

        beforeEach(function* () {
            [insb, inc] = yield ['insb', 'inc']
            .map(name => fixtureLoader.createDomain({ name }));
        });

        it('should add given domains if they exists', function* () {
            const institute = yield instituteQueries.insertOne({ name: 'biology', code: '53', domains: ['insb', 'inc'] });

            const instituteDomains = yield domainQueries.selectByInstitute(institute);
            assert.deepEqual(instituteDomains, [inc, insb].map(domain => ({ ...domain, totalcount: '2', institute_id: institute.id })));
        });

        it('should throw an error if trying to insert an institute with domain that do not exists', function* () {
            let error;
            try {
                yield instituteQueries.insertOne({ name: 'biology', code: '53', domains: ['insb', 'nemo'] });
            } catch (e) {
                error = e;
            }
            assert.equal(error.message, 'Domains nemo does not exists');

            const insertedInstitute = yield postgres.queryOne({sql: 'SELECT * from institute WHERE name=$name', parameters: { name: 'biology'} });
            assert.isUndefined(insertedInstitute);
        });
    });

    describe('upsertOnePerCode', function () {
        it('should create a new institute if none exists with the same code', function* () {
            const institute = yield instituteQueries.upsertOnePerCode({ name: 'biology', code: '53' });
            assert.deepEqual(institute, {
                id: institute.id,
                name: 'biology',
                code: '53'
            });

            const insertedInstitute = yield postgres.queryOne({sql: 'SELECT * from institute WHERE name=$name', parameters: { name: 'biology'} });
            assert.deepEqual(insertedInstitute, institute);
        });

        it('should update existing institute with the same code', function* () {
            const previousInstitute = yield fixtureLoader.createInstitute({ name: 'bilogy', code: '53' });
            const institute = yield instituteQueries.upsertOnePerCode({ name: 'biology', code: '53' });
            assert.deepEqual(institute, {
                id: institute.id,
                name: 'biology',
                code: '53'
            });

            const updatedInstitute = yield postgres.queryOne({sql: 'SELECT * from institute WHERE id=$id', parameters: { id: previousInstitute.id } });
            assert.deepEqual(updatedInstitute, institute);
            assert.notDeepEqual(updatedInstitute, previousInstitute);
        });
    });

    afterEach(function* () {
        yield fixtureLoader.clear();
    });

});
