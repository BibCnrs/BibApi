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
            unit = yield fixtureLoader.createUnit({ code: 'biology', domains: ['vie', 'shs']});
        });

        it ('should return one unit by id', function* () {

            assert.deepEqual(yield unitQueries.selectOne({ id: unit.id }), {
                id: unit.id,
                code: 'biology',
                name: null,
                body: null,
                building: null,
                cd_mail: null,
                cd_phone: null,
                ci_mail: null,
                ci_phone: null,
                correspondant_documentaire: null,
                correspondant_informatique: null,
                country: null,
                director_firstname: null,
                director_mail: null,
                director_name: null,
                nb_doctorant: null,
                nb_post_doctorant: null,
                nb_researcher_cnrs: null,
                nb_researcher_nocnrs: null,
                nb_unit_account: null,
                postal_code: null,
                post_office_box: null,
                street: null,
                town: null,
                unit_dr: null,
                comment: null,
                domains: ['vie', 'shs'],
                institutes: []
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
            chemestry = yield fixtureLoader.createUnit({ code: 'chemestry', domains: ['vie', 'shs']});
            biology = yield fixtureLoader.createUnit({ code: 'biology', domains: ['vie', 'nuclear']});
            humanity = yield fixtureLoader.createUnit({ code: 'humanity', domains: ['universe', 'nuclear']});
        });

        it ('should return one unit by id', function* () {

            assert.deepEqual(yield unitQueries.selectPage(), [
                {
                    id: chemestry.id,
                    totalcount: '3',
                    code: 'chemestry',
                    name: null,
                    body: null,
                    building: null,
                    cd_mail: null,
                    cd_phone: null,
                    ci_mail: null,
                    ci_phone: null,
                    correspondant_documentaire: null,
                    correspondant_informatique: null,
                    country: null,
                    director_firstname: null,
                    director_mail: null,
                    director_name: null,
                    nb_doctorant: null,
                    nb_post_doctorant: null,
                    nb_researcher_cnrs: null,
                    nb_researcher_nocnrs: null,
                    nb_unit_account: null,
                    postal_code: null,
                    post_office_box: null,
                    street: null,
                    town: null,
                    unit_dr: null,
                    comment: null,
                    domains: ['vie', 'shs'],
                    institutes: []
                }, {
                    id: biology.id,
                    totalcount: '3',
                    code: 'biology',
                    name: null,
                    body: null,
                    building: null,
                    cd_mail: null,
                    cd_phone: null,
                    ci_mail: null,
                    ci_phone: null,
                    correspondant_documentaire: null,
                    correspondant_informatique: null,
                    country: null,
                    director_firstname: null,
                    director_mail: null,
                    director_name: null,
                    nb_doctorant: null,
                    nb_post_doctorant: null,
                    nb_researcher_cnrs: null,
                    nb_researcher_nocnrs: null,
                    nb_unit_account: null,
                    postal_code: null,
                    post_office_box: null,
                    street: null,
                    town: null,
                    unit_dr: null,
                    comment: null,
                    domains: ['vie', 'nuclear'],
                    institutes: []
                }, {
                    id: humanity.id,
                    totalcount: '3',
                    code: 'humanity',
                    name: null,
                    body: null,
                    building: null,
                    cd_mail: null,
                    cd_phone: null,
                    ci_mail: null,
                    ci_phone: null,
                    correspondant_documentaire: null,
                    correspondant_informatique: null,
                    country: null,
                    director_firstname: null,
                    director_mail: null,
                    director_name: null,
                    nb_doctorant: null,
                    nb_post_doctorant: null,
                    nb_researcher_cnrs: null,
                    nb_researcher_nocnrs: null,
                    nb_unit_account: null,
                    postal_code: null,
                    post_office_box: null,
                    street: null,
                    town: null,
                    unit_dr: null,
                    comment: null,
                    domains: ['universe', 'nuclear'],
                    institutes: []
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

            unit = yield fixtureLoader.createUnit({ code: 'biology', domains: ['insb', 'inc']});
        });

        it('should throw an error if trying to add a domain which does not exists and abort modification', function* () {
            let error;
            try {
                yield unitQueries.updateOne(unit.id, { domains: ['nemo', 'inshs'] });
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Domains nemo does not exists');

            const unitDomains = yield postgres.query({
                sql: 'SELECT * FROM unit_domain WHERE unit_id=$id',
                parameters: { id: unit.id }
            });
            assert.deepEqual(unitDomains, [
                { unit_id: unit.id, domain_id: insb.id, index: 0 },
                { unit_id: unit.id, domain_id: inc.id, index: 1 }
            ]);
        });

        it('should add given new domain', function* () {
            yield unitQueries.updateOne(unit.id, { domains: ['insb', 'inc', 'inshs'] });

            const unitDomains = yield postgres.query({
                sql: 'SELECT * FROM unit_domain WHERE unit_id=$id',
                parameters: { id: unit.id }
            });
            assert.deepEqual(unitDomains, [
                { unit_id: unit.id, domain_id: insb.id, index: 0 },
                { unit_id: unit.id, domain_id: inc.id, index: 1 },
                { unit_id: unit.id, domain_id: inshs.id, index: 2 }
            ]);
        });

        it('should remove missing domain', function* () {
            yield unitQueries.updateOne(unit.id, { domains: ['insb'] });

            const unitDomains = yield postgres.query({
                sql: 'SELECT * FROM unit_domain WHERE unit_id=$id',
                parameters: { id: unit.id }
            });
            assert.deepEqual(unitDomains, [
                { unit_id: unit.id, domain_id: insb.id, index: 0 }
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
            const unit = yield unitQueries.insertOne({ code: 'biology', domains: ['inc', 'insb'] });

            const unitDomains = yield domainQueries.selectByUnitId(unit.id);
            assert.deepEqual(unitDomains, [inc, insb].map((domain, index) => ({ ...domain, totalcount: '2', index, unit_id: unit.id })));
        });

        it('should throw an error if trying to insert an unit with domain that do not exists', function* () {
            let error;
            try {
                yield unitQueries.insertOne({ code: 'biology', domains: ['insb', 'nemo'] });
            } catch (e) {
                error = e;
            }
            assert.equal(error.message, 'Domains nemo does not exists');

            const insertedunit = yield postgres.queryOne({sql: 'SELECT * from unit WHERE code=$code', parameters: { code: 'biology'} });
            assert.isUndefined(insertedunit);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('upsertOnePerCode', function () {
        it('should create a new unit if none exists with the same code', function* () {
            const unitToUpsert = {
                name: null,
                code: 'biology',
                body: null,
                building: null,
                cd_mail: null,
                cd_phone: null,
                ci_mail: null,
                ci_phone: null,
                correspondant_documentaire: null,
                correspondant_informatique: null,
                country: null,
                director_firstname: null,
                director_mail: null,
                director_name: null,
                nb_doctorant: 7,
                nb_post_doctorant: 5,
                nb_researcher_cnrs: 4,
                nb_researcher_nocnrs: 0,
                nb_unit_account: 108,
                postal_code: null,
                post_office_box: null,
                street: null,
                town: null,
                unit_dr: null,
                comment: 'some comment'
            };

            const unit = yield unitQueries.upsertOnePerCode(unitToUpsert);
            assert.deepEqual(unit, {
                ...unitToUpsert,
                id: unit.id
            });

            const insertedUnit = yield postgres.queryOne({sql: 'SELECT * from unit WHERE code=$code', parameters: { code: 'biology'} });
            assert.deepEqual(insertedUnit, unit);
        });

        it('should update existing institute with the same code', function* () {
            const unitToUpsert = {
                name: null,
                code: 'biology',
                body: null,
                building: null,
                cd_mail: null,
                cd_phone: null,
                ci_mail: null,
                ci_phone: null,
                correspondant_documentaire: null,
                correspondant_informatique: null,
                country: null,
                director_firstname: null,
                director_mail: null,
                director_name: null,
                nb_doctorant: 7,
                nb_post_doctorant: 5,
                nb_researcher_cnrs: 4,
                nb_researcher_nocnrs: 0,
                nb_unit_account: 108,
                postal_code: null,
                post_office_box: null,
                street: null,
                town: null,
                unit_dr: null,
                comment: 'updated comment'
            };

            const previousUnit = yield fixtureLoader.createUnit({ code: 'biology', comment: 'some comment' });
            const unit = yield unitQueries.upsertOnePerCode(unitToUpsert);
            assert.deepEqual(unit, {
                id: unit.id,
                ...unitToUpsert
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
            [cern, inist] = yield ['cern', 'inist', 'marmelab']
            .map(code => fixtureLoader.createUnit({ code }));
        });

        it('should return each institute with given ids', function* () {
            assert.deepEqual(yield unitQueries.selectByIds([cern.id, inist.id]), [
                {
                    id: cern.id,
                    code: cern.code,
                    name: null
                }, {
                    id: inist.id,
                    code: inist.code,
                    name: null
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

    describe('selectByJanusAccountIdQuery', function () {
        it('should return additional_units of user', function* () {

            const [cern, inist, marmelab] = yield ['cern', 'inist', 'marmelab']
            .map(code => fixtureLoader.createUnit({ code }));

            const john = yield fixtureLoader.createJanusAccount({ username: 'john', additional_units: [cern.id, inist.id]});
            const jane = yield fixtureLoader.createJanusAccount({ username: 'jane', additional_units: [inist.id, marmelab.id]});
            assert.deepEqual(yield unitQueries.selectByJanusAccountId(john.id), [
                {
                    id: cern.id,
                    code: cern.code,
                    totalcount: '2',
                    index: 0,
                    janus_account_id: john.id
                },
                {
                    id: inist.id,
                    code: inist.code,
                    totalcount: '2',
                    index: 1,
                    janus_account_id: john.id
                }
            ]);
            assert.deepEqual(yield unitQueries.selectByJanusAccountId(jane.id), [
                {
                    id: inist.id,
                    code: inist.code,
                    totalcount: '2',
                    index: 0,
                    janus_account_id: jane.id
                },
                {
                    id: marmelab.id,
                    code: marmelab.code,
                    totalcount: '2',
                    index: 1,
                    janus_account_id: jane.id
                }
            ]);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectByInistAccountIdQuery', function () {
        it('should return additional_units of user', function* () {

            const [cern, inist, marmelab] = yield ['cern', 'inist', 'marmelab']
            .map(code => fixtureLoader.createUnit({ code }));

            const john = yield fixtureLoader.createInistAccount({ username: 'john', units: [cern.id, inist.id]});
            const jane = yield fixtureLoader.createInistAccount({ username: 'jane', units: [inist.id, marmelab.id]});
            assert.deepEqual(yield unitQueries.selectByInistAccountId(john.id), [
                {
                    id: cern.id,
                    code: cern.code,
                    totalcount: '2',
                    index: 0,
                    inist_account_id: john.id
                },
                {
                    id: inist.id,
                    code: inist.code,
                    totalcount: '2',
                    index: 1,
                    inist_account_id: john.id
                }
            ]);
            assert.deepEqual(yield unitQueries.selectByInistAccountId(jane.id), [
                {
                    id: inist.id,
                    code: inist.code,
                    totalcount: '2',
                    index: 0,
                    inist_account_id: jane.id
                },
                {
                    id: marmelab.id,
                    code: marmelab.code,
                    totalcount: '2',
                    index: 1,
                    inist_account_id: jane.id
                }
            ]);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

});
