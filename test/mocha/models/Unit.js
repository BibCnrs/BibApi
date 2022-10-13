import {
    getUnits,
    selectByIds,
    selectByInistAccountId,
    selectByJanusAccountId,
    selectOne,
    updateOne,
    upsertOnePerCode,
} from '../../../lib/models/Unit';
import { selectByUnitId } from '../../../lib/models/Community';
import { insertOne } from '../../../lib/models/Institute';

describe('model Unit', function () {
    describe('selectOne', function () {
        let unit, vie, shs, dgds, insmi, in2p3, section;

        before(function* () {
            vie = yield fixtureLoader.createCommunity({
                name: 'vie',
                gate: 'insb',
            });
            shs = yield fixtureLoader.createCommunity({
                name: 'shs',
                gate: 'inshs',
            });
            yield fixtureLoader.createCommunity({
                name: 'nuclear',
                gate: 'in2p3',
            });
            yield fixtureLoader.createCommunity({
                name: 'universe',
                gate: 'insu',
            });

            section = yield fixtureLoader.createSectionCN();

            [dgds, insmi, in2p3] = yield [
                fixtureLoader.createInstitute({
                    name: 'dgds',
                    code: 'ds99',
                }),
                fixtureLoader.createInstitute({
                    name: 'insmi',
                    code: 'ds57',
                }),
                fixtureLoader.createInstitute({
                    name: 'in2p3',
                    code: 'ds58',
                }),
            ];
            unit = yield fixtureLoader.createUnit({
                code: 'biology',
                communities: [vie.id, shs.id],
                main_institute: dgds.id,
                institutes: [insmi.id, in2p3.id],
                sections_cn: [section.id],
            });

            yield [
                fixtureLoader.createInistAccount({
                    username: 'john',
                    main_unit: unit.id,
                }),
                fixtureLoader.createInistAccount({
                    username: 'jane',
                    main_unit: unit.id,
                }),
            ];
        });

        it('should return one unit by id', function* () {
            assert.deepEqual(yield selectOne({ id: unit.id }), {
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
                postal_code: null,
                post_office_box: null,
                street: null,
                town: null,
                unit_dr: null,
                main_institute: dgds.id,
                comment: null,
                communities: [vie.id, shs.id],
                institutes: [insmi.id, in2p3.id],
                nb_inist_account: 2,
                nb_janus_account: 0,
                sections_cn: [section.id],
                implantation: null,
                active: true,
            });
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectPage', function () {
        let biology,
            chemestry,
            humanity,
            vie,
            shs,
            universe,
            nuclear,
            inshs,
            insb,
            insu,
            in2p3,
            section;
        before(function* () {
            vie = yield fixtureLoader.createCommunity({
                name: 'vie',
                gate: 'insb',
            });
            shs = yield fixtureLoader.createCommunity({
                name: 'shs',
                gate: 'inshs',
            });
            universe = yield fixtureLoader.createCommunity({
                name: 'universe',
                gate: 'insu',
            });
            nuclear = yield fixtureLoader.createCommunity({
                name: 'nuclear',
                gate: 'in2p3',
            });

            section = yield fixtureLoader.createSectionCN();

            [inshs, insb, insu, in2p3] = yield [
                fixtureLoader.createInstitute({
                    name: 'inshs',
                    code: 'DS54',
                }),
                fixtureLoader.createInstitute({
                    name: 'insb',
                    code: 'DS56',
                }),
                fixtureLoader.createInstitute({
                    name: 'insu',
                    code: 'DS55',
                }),
                fixtureLoader.createInstitute({
                    name: 'in2p3',
                    code: 'DS57',
                }),
            ];

            chemestry = yield fixtureLoader.createUnit({
                code: 'chemestry',
                communities: [vie.id, shs.id],
                main_institute: insb.id,
                institutes: [inshs.id],
                sections_cn: [section.id],
            });
            biology = yield fixtureLoader.createUnit({
                code: 'biology',
                communities: [vie.id, nuclear.id],
                main_institute: insb.id,
                institutes: [in2p3.id],
            });
            humanity = yield fixtureLoader.createUnit({
                code: 'humanity',
                communities: [universe.id, nuclear.id],
                main_institute: inshs.id,
                institutes: [insu.id, in2p3.id],
                sections_cn: [section.id],
            });

            yield [
                fixtureLoader.createInistAccount({
                    username: '1',
                    main_unit: chemestry.id,
                }),
                fixtureLoader.createInistAccount({
                    username: '2',
                    main_unit: chemestry.id,
                }),
                fixtureLoader.createInistAccount({
                    username: '3',
                    main_unit: biology.id,
                }),
                fixtureLoader.createInistAccount({
                    username: '4',
                    main_unit: humanity.id,
                }),
            ];

            yield [
                fixtureLoader.createJanusAccount({
                    uid: '1',
                    primary_unit: chemestry.id,
                }),
                fixtureLoader.createJanusAccount({
                    uid: '2',
                    primary_unit: biology.id,
                }),
                fixtureLoader.createJanusAccount({
                    uid: '3',
                    primary_unit: biology.id,
                }),
                fixtureLoader.createJanusAccount({
                    uid: '4',
                    primary_unit: humanity.id,
                }),
            ];
        });

        it('should return one unit by id', function* () {
            assert.deepEqual(yield getUnits(), [
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
                    postal_code: null,
                    post_office_box: null,
                    street: null,
                    town: null,
                    unit_dr: null,
                    comment: null,
                    communities: [vie.id, shs.id],
                    main_institute: insb.id,
                    institutes: [inshs.id],
                    nb_inist_account: 2,
                    nb_janus_account: 1,
                    sections_cn: [section.id],
                    implantation: null,
                    active: true,
                },
                {
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
                    postal_code: null,
                    post_office_box: null,
                    street: null,
                    town: null,
                    unit_dr: null,
                    comment: null,
                    communities: [vie.id, nuclear.id],
                    main_institute: insb.id,
                    institutes: [in2p3.id],
                    nb_inist_account: 1,
                    nb_janus_account: 2,
                    sections_cn: [],
                    implantation: null,
                    active: true,
                },
                {
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
                    postal_code: null,
                    post_office_box: null,
                    street: null,
                    town: null,
                    unit_dr: null,
                    comment: null,
                    communities: [universe.id, nuclear.id],
                    main_institute: inshs.id,
                    institutes: [insu.id, in2p3.id],
                    nb_inist_account: 1,
                    nb_janus_account: 1,
                    sections_cn: [section.id],
                    implantation: null,
                    active: true,
                },
            ]);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('updateOne', function () {
        let unit, insb, inc, inshs;

        beforeEach(function* () {
            [insb, inc, inshs] = yield ['insb', 'inc', 'inshs'].map((name) =>
                fixtureLoader.createCommunity({ name }),
            );

            unit = yield fixtureLoader.createUnit({
                code: 'biology',
                communities: [insb.id, inc.id],
            });
        });

        it('should throw an error if trying to add a community which does not exists and abort modification', function* () {
            let error;
            try {
                yield updateOne(unit.id, {
                    communities: ['nemo', inshs.id],
                });
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Communities nemo does not exists');

            const unitCommunities = yield postgres.query({
                sql: 'SELECT * FROM unit_community WHERE unit_id=$id',
                parameters: { id: unit.id },
            });
            assert.deepEqual(unitCommunities, [
                {
                    unit_id: unit.id,
                    community_id: insb.id,
                    index: 0,
                },
                {
                    unit_id: unit.id,
                    community_id: inc.id,
                    index: 1,
                },
            ]);
        });

        it('should add given new community', function* () {
            yield updateOne(unit.id, {
                communities: [insb.id, inc.id, inshs.id],
            });

            const unitCommunities = yield postgres.query({
                sql: 'SELECT * FROM unit_community WHERE unit_id=$id',
                parameters: { id: unit.id },
            });
            assert.deepEqual(unitCommunities, [
                {
                    unit_id: unit.id,
                    community_id: insb.id,
                    index: 0,
                },
                {
                    unit_id: unit.id,
                    community_id: inc.id,
                    index: 1,
                },
                {
                    unit_id: unit.id,
                    community_id: inshs.id,
                    index: 2,
                },
            ]);
        });

        it('should remove missing community', function* () {
            yield updateOne(unit.id, {
                communities: [insb.id],
            });

            const unitCommunities = yield postgres.query({
                sql: 'SELECT * FROM unit_community WHERE unit_id=$id',
                parameters: { id: unit.id },
            });
            assert.deepEqual(unitCommunities, [
                {
                    unit_id: unit.id,
                    community_id: insb.id,
                    index: 0,
                },
            ]);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('insertOne', function () {
        let insb, inc;

        beforeEach(function* () {
            [insb, inc] = yield ['insb', 'inc'].map((name) =>
                fixtureLoader.createCommunity({ name }),
            );
        });

        it('should add given communities if they exists', function* () {
            const unit = yield insertOne({
                code: 'biology',
                communities: [inc.id, insb.id],
            });

            const unitCommunities = yield selectByUnitId(unit.id);
            assert.deepEqual(
                unitCommunities,
                [inc, insb].map((community, index) => ({
                    ...community,
                    totalcount: '2',
                    index,
                    unit_id: unit.id,
                })),
            );
        });

        it('should throw an error if trying to insert an unit with community that do not exists', function* () {
            let error;
            try {
                yield insertOne({
                    code: 'biology',
                    communities: [insb.id, 'nemo'],
                });
            } catch (e) {
                error = e;
            }
            assert.equal(error.message, 'Communities nemo does not exists');

            const insertedunit = yield postgres.queryOne({
                sql: 'SELECT * from unit WHERE code=$code',
                parameters: { code: 'biology' },
            });
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
                postal_code: null,
                post_office_box: null,
                street: null,
                town: null,
                unit_dr: null,
                main_institute: null,
                comment: 'some comment',
                implantation: null,
                active: true,
            };

            const unit = yield upsertOnePerCode(unitToUpsert);
            assert.deepEqual(unit, {
                ...unitToUpsert,
                id: unit.id,
            });

            const insertedUnit = yield postgres.queryOne({
                sql: 'SELECT * from unit WHERE code=$code',
                parameters: { code: 'biology' },
            });
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
                postal_code: null,
                post_office_box: null,
                street: null,
                town: null,
                unit_dr: null,
                main_institute: null,
                comment: 'updated comment',
                implantation: null,
                active: true,
            };

            const previousUnit = yield fixtureLoader.createUnit({
                code: 'biology',
                comment: 'some comment',
            });
            const unit = yield upsertOnePerCode(unitToUpsert);
            assert.deepEqual(unit, {
                id: unit.id,
                ...unitToUpsert,
            });

            const updatedUnit = yield postgres.queryOne({
                sql: 'SELECT * from unit WHERE id=$id',
                parameters: { id: previousUnit.id },
            });
            assert.deepEqual(updatedUnit, unit);
            assert.notDeepEqual(updatedUnit, previousUnit);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectByIds', function () {
        let cern, inist;

        before(function* () {
            [cern, inist] = yield ['cern', 'inist', 'marmelab'].map((code) =>
                fixtureLoader.createUnit({ code }),
            );
        });

        it('should return each institute with given ids', function* () {
            assert.deepEqual(yield selectByIds([cern.id, inist.id]), [
                {
                    id: cern.id,
                    code: cern.code,
                    name: null,
                },
                {
                    id: inist.id,
                    code: inist.code,
                    name: null,
                },
            ]);
        });

        it('should throw an error if trying to retrieve an unit that does not exists', function* () {
            let error;

            try {
                yield selectByIds([cern.id, inist.id, 0]);
            } catch (e) {
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
            const [cern, inist, marmelab] = yield [
                'cern',
                'inist',
                'marmelab',
            ].map((code) => fixtureLoader.createUnit({ code }));

            const john = yield fixtureLoader.createJanusAccount({
                uid: 'john',
                additional_units: [cern.id, inist.id],
            });
            const jane = yield fixtureLoader.createJanusAccount({
                uid: 'jane',
                additional_units: [inist.id, marmelab.id],
            });
            assert.deepEqual(yield selectByJanusAccountId(john.id), [
                {
                    id: cern.id,
                    code: cern.code,
                    totalcount: '2',
                    index: 0,
                    janus_account_id: john.id,
                },
                {
                    id: inist.id,
                    code: inist.code,
                    totalcount: '2',
                    index: 1,
                    janus_account_id: john.id,
                },
            ]);
            assert.deepEqual(yield selectByJanusAccountId(jane.id), [
                {
                    id: inist.id,
                    code: inist.code,
                    totalcount: '2',
                    index: 0,
                    janus_account_id: jane.id,
                },
                {
                    id: marmelab.id,
                    code: marmelab.code,
                    totalcount: '2',
                    index: 1,
                    janus_account_id: jane.id,
                },
            ]);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectByInistAccountIdQuery', function () {
        it('should return additional_units of user', function* () {
            const [cern, inist, marmelab] = yield [
                'cern',
                'inist',
                'marmelab',
            ].map((code) => fixtureLoader.createUnit({ code }));
            const john = yield fixtureLoader.createInistAccount({
                username: 'john',
                units: [cern.id, inist.id],
            });

            const jane = yield fixtureLoader.createInistAccount({
                username: 'jane',
                units: [inist.id, marmelab.id],
            });
            assert.deepEqual(yield selectByInistAccountId(john.id), [
                {
                    id: cern.id,
                    code: cern.code,
                    totalcount: '2',
                    index: 0,
                    inist_account_id: john.id,
                },
                {
                    id: inist.id,
                    code: inist.code,
                    totalcount: '2',
                    index: 1,
                    inist_account_id: john.id,
                },
            ]);
            assert.deepEqual(yield selectByInistAccountId(jane.id), [
                {
                    id: inist.id,
                    code: inist.code,
                    totalcount: '2',
                    index: 0,
                    inist_account_id: jane.id,
                },
                {
                    id: marmelab.id,
                    code: marmelab.code,
                    totalcount: '2',
                    index: 1,
                    inist_account_id: jane.id,
                },
            ]);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });
});
