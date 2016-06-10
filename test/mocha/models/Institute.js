import Institute from '../../../lib/models/Institute';

describe('model Institute', function () {
    let instituteQueries;

    before(function () {
        instituteQueries = Institute(postgres);
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
                    domains: ['vie', 'shs']
                }, {
                    id: biology.id,
                    totalcount: '3',
                    name: 'biology',
                    code: '53',
                    domains: ['vie', 'nuclear']
                }, {
                    id: humanity.id,
                    totalcount: '3',
                    name: 'humanity',
                    code: '54',
                    domains: ['universe', 'nuclear']
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

            const instituteDomains = yield postgres.query({
                sql: 'SELECT * FROM institute_domain WHERE institute_id=$id',
                parameters: { id: institute.id }
            });
            assert.deepEqual(instituteDomains, [
                { institute_id: institute.id, domain_id: insb.id, index: 0 },
                { institute_id: institute.id, domain_id: inc.id, index: 1 }
            ]);
        });

        it('should add given new domain', function* () {
            yield instituteQueries.updateOne(institute.id, { domains: ['insb', 'inc', 'inshs'] });

            const instituteDomains = yield postgres.query({
                sql: 'SELECT * FROM institute_domain WHERE institute_id=$id',
                parameters: { id: institute.id }
            });
            assert.deepEqual(instituteDomains, [
                { institute_id: institute.id, domain_id: insb.id, index: 0 },
                { institute_id: institute.id, domain_id: inc.id, index: 1 },
                { institute_id: institute.id, domain_id: inshs.id, index: 2 }
            ]);
        });

        it('should remove missing domain', function* () {
            yield instituteQueries.updateOne(institute.id, { domains: ['insb'] });

            const instituteDomains = yield postgres.query({
                sql: 'SELECT * FROM institute_domain WHERE institute_id=$id',
                parameters: { id: institute.id }
            });
            assert.deepEqual(instituteDomains, [
                { institute_id: institute.id, domain_id: insb.id, index: 0 }
            ]);
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
            const institute = yield instituteQueries.insertOne({ name: 'biology', code: '53', domains: ['inc', 'insb'] });

            const instituteDomains = yield postgres.query({
                sql: 'SELECT * FROM institute_domain WHERE institute_id=$id',
                parameters: { id: institute.id }
            });
            assert.deepEqual(instituteDomains, [
                { institute_id: institute.id, domain_id: inc.id, index: 0 },
                { institute_id: institute.id, domain_id: insb.id, index: 1 }
            ]);
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

        afterEach(function* () {
            yield fixtureLoader.clear();
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

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectByIds', function () {
        let institute53, institute54;

        before(function*  () {
            [institute53, institute54] = yield ['53', '54', '55']
            .map(code => fixtureLoader.createInstitute({ code, name: `Institute ${code}` }));
        });

        it('should return each institutes with given ids', function* () {

            assert.deepEqual(yield instituteQueries.selectByIds([institute53.id, institute54.id]), [
                {
                    id: institute53.id,
                    name: institute53.name,
                    code: institute53.code
                }, {
                    id: institute54.id,
                    name: institute54.name,
                    code: institute54.code
                }
            ]);
        });

        it('should throw an error if trying to retrieve an institute that does not exists', function* () {
            let error;

            try {
                yield instituteQueries.selectByIds([institute53.id, institute54.id, 0]);
            } catch(e) {
                error = e;
            }
            assert.equal(error.message, 'Institutes 0 does not exists');
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectByJanusAccountIdQuery', function () {
        it('should return additional_institute of user', function* () {

            const [institute53, institute54, institute55] = yield ['53', '54', '55']
            .map(code => fixtureLoader.createInstitute({ code, name: `Institute ${code}` }));

            const john = yield fixtureLoader.createJanusAccount({ username: 'john', additional_institutes: [institute53.id, institute54.id]});
            const jane = yield fixtureLoader.createJanusAccount({ username: 'jane', additional_institutes: [institute54.id, institute55.id]});
            assert.deepEqual(yield instituteQueries.selectByJanusAccountId(john.id), [
                { id: institute53.id, code: institute53.code, name: institute53.name, totalcount: '2', index: 0, janus_account_id: john.id },
                { id: institute54.id, code: institute54.code, name: institute54.name, totalcount: '2', index: 1, janus_account_id: john.id }
            ]);
            assert.deepEqual(yield instituteQueries.selectByJanusAccountId(jane.id), [
                { id: institute54.id, code: institute54.code, name: institute54.name, totalcount: '2', index: 0, janus_account_id: jane.id },
                { id: institute55.id, code: institute55.code, name: institute55.name, totalcount: '2', index: 1, janus_account_id: jane.id }
            ]);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectByInistAccountIdQuery', function () {
        it('should return additional_institute of user', function* () {

            const [institute53, institute54, institute55] = yield ['53', '54', '55']
            .map(code => fixtureLoader.createInstitute({ code, name: `Institute ${code}` }));

            const john = yield fixtureLoader.createInistAccount({ username: 'john', institutes: [institute53.id, institute54.id]});
            const jane = yield fixtureLoader.createInistAccount({ username: 'jane', institutes: [institute54.id, institute55.id]});
            assert.deepEqual(yield instituteQueries.selectByInistAccountId(john.id), [
                { id: institute53.id, code: institute53.code, name: institute53.name, totalcount: '2', index: 0, inist_account_id: john.id },
                { id: institute54.id, code: institute54.code, name: institute54.name, totalcount: '2', index: 1, inist_account_id: john.id }
            ]);
            assert.deepEqual(yield instituteQueries.selectByInistAccountId(jane.id), [
                { id: institute54.id, code: institute54.code, name: institute54.name, totalcount: '2', index: 0, inist_account_id: jane.id },
                { id: institute55.id, code: institute55.code, name: institute55.name, totalcount: '2', index: 1, inist_account_id: jane.id }
            ]);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectByUnitIdQuery', function () {
        it('should return additional_institute of user', function* () {

            const [institute53, institute54, institute55] = yield ['53', '54', '55']
            .map(code => fixtureLoader.createInstitute({ code, name: `Institute ${code}` }));

            const cern = yield fixtureLoader.createUnit({ name: 'cern', code: 'cern', institutes: [institute53.id, institute54.id]});
            const inist = yield fixtureLoader.createUnit({ name: 'inist', code: 'inist', institutes: [institute54.id, institute55.id]});
            assert.deepEqual(yield instituteQueries.selectByUnitId(cern.id), [
                { id: institute53.id, code: institute53.code, name: institute53.name, totalcount: '2', index: 0, unit_id: cern.id },
                { id: institute54.id, code: institute54.code, name: institute54.name, totalcount: '2', index: 1, unit_id: cern.id }
            ]);
            assert.deepEqual(yield instituteQueries.selectByUnitId(inist.id), [
                { id: institute54.id, code: institute54.code, name: institute54.name, totalcount: '2', index: 0, unit_id: inist.id },
                { id: institute55.id, code: institute55.code, name: institute55.name, totalcount: '2', index: 1, unit_id: inist.id }
            ]);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

});
