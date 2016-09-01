import JanusAccount from '../../../lib/models/JanusAccount';

describe('model JanusAccount', function () {
    let janusAccountQueries;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    before(function () {
        janusAccountQueries = JanusAccount(postgres);
    });

    describe('selectOne', function () {
        let user, institute53, institute54, institute55, cern, inist;

        before(function* () {
            yield ['in2p3', 'inc', 'inee', 'inp', 'ins2i', 'insb', 'inshs', 'insis', 'insmi', 'insu']
            .map(name => fixtureLoader.createDomain({ name, gate: name }));

            const instituteDomain = {
                53: 'in2p3',
                54: 'insu',
                55: 'insmi'
            };

            [institute53, institute54, institute55] = yield [53, 54, 55]
            .map(code => fixtureLoader.createInstitute({ code, name: `Institute${code}`, domains: [instituteDomain[code]]}));

            [cern, inist] = yield ['cern', 'inist']
            .map((code) => fixtureLoader.createUnit({ code, domains: [code === 'cern' ? 'inc' : 'inee'], institutes: [institute55.id] }));

            user = yield fixtureLoader.createJanusAccount({
                uid: 'uid',
                name: 'doe',
                firstname: 'jane',
                mail: 'jane@doe.com',
                cnrs: true,
                comment: 'no comment',
                last_connexion: today,
                domains: ['insb', 'inshs'],
                primary_institute: institute54.id,
                additional_institutes: [institute53.id],
                primary_unit: inist.id,
                additional_units: [cern.id]
            });
        });

        it('should return one user by id', function* () {

            assert.deepEqual(yield janusAccountQueries.selectOne({ id: user.id }), {
                id: user.id,
                uid: 'uid',
                firstname: 'jane',
                name: 'doe',
                mail: 'jane@doe.com',
                comment: 'no comment',
                last_connexion: today,
                cnrs: true,
                primary_unit: inist.id,
                primary_unit_domains: ['inee'],
                primary_unit_groups: ['inee'],
                primary_unit_institutes_domains: ['insmi'],
                primary_unit_institutes_groups: ['insmi'],
                additional_units: [cern.id],
                additional_units_domains: ['inc'],
                additional_units_groups: ['inc'],
                additional_units_institutes_domains: ['insmi'],
                additional_units_institutes_groups: ['insmi'],
                primary_institute: institute54.id,
                primary_institute_domains: ['insu'],
                primary_institute_groups: ['insu'],
                additional_institutes: [institute53.id],
                additional_institutes_domains: ['in2p3'],
                additional_institutes_groups: ['in2p3'],
                domains: ['insb', 'inshs'],
                groups: ['insb', 'inshs'],
                all_domains: ['insu', 'in2p3', 'inee', 'insmi', 'inc', 'insb', 'inshs'],
                all_groups: ['insu', 'in2p3', 'inee', 'insmi', 'inc', 'insb', 'inshs']
            });
        });

        after(function* () {
            yield fixtureLoader.clear();
        });

    });

    describe('selectPage', function () {
        let john, jane, will, institute53, institute54, institute55, cern, inist;

        before(function* () {
            yield ['in2p3', 'inc', 'inee', 'inp', 'ins2i', 'insb', 'inshs', 'insis', 'insmi', 'insu']
            .map(name => fixtureLoader.createDomain({ name, gate: name }));


            const instituteDomains = {
                53: ['in2p3'],
                54: ['insu'],
                55: ['insmi']
            };
            [institute53, institute54, institute55] = yield [53, 54, 55]
            .map(code => fixtureLoader.createInstitute({ code, name: `Institute${code}`, domains: instituteDomains[code] }));

            const unitInstitutes = {
                cern: [institute53.id],
                inist: [institute54.id, institute55.id]
            };
            [cern, inist] = yield ['cern', 'inist']
            .map((code) => fixtureLoader.createUnit({ code, domains: [code === 'cern' ? 'inc' : 'inee'], institutes: unitInstitutes[code] }));

            jane = yield fixtureLoader.createJanusAccount({
                uid: 'jane.doe',
                name: 'doe',
                firstname: 'jane',
                mail: 'jane@doe.com',
                cnrs: true,
                last_connexion: today,
                comment: 'jane comment',
                domains: ['insb', 'inshs'],
                primary_institute: institute54.id,
                additional_institutes: [institute53.id],
                primary_unit: inist.id,
                additional_units: [cern.id]
            });

            john = yield fixtureLoader.createJanusAccount({
                uid: 'john.doe',
                firstname: 'john',
                name: 'doe',
                mail: 'john@doe.com',
                cnrs: false,
                last_connexion: today,
                comment: 'john comment',
                domains: ['insb', 'in2p3'],
                primary_institute: institute53.id,
                additional_institutes: [institute54.id],
                primary_unit: cern.id,
                additional_units: [inist.id]
            });

            will = yield fixtureLoader.createJanusAccount({
                uid: 'will.doe',
                firstname: 'will',
                name: 'doe',
                mail: 'will@doe.com',
                cnrs: false,
                last_connexion: today,
                comment: 'will comment',
                domains: ['insu', 'in2p3'],
                primary_institute: null,
                additional_institutes: [],
                primary_unit: null,
                additional_units: []
            });
        });

        it('should return one user by id', function* () {

            assert.deepEqual(yield janusAccountQueries.selectPage(), [
                {
                    id: jane.id,
                    totalcount: '3',
                    uid: 'jane.doe',
                    name: 'doe',
                    firstname: 'jane',
                    mail: 'jane@doe.com',
                    cnrs: true,
                    comment: 'jane comment',
                    last_connexion: today,
                    primary_unit: inist.id,
                    primary_unit_domains: ['inee'],
                    primary_unit_groups: ['inee'],
                    primary_unit_institutes_domains: ['insu', 'insmi'],
                    primary_unit_institutes_groups: ['insu', 'insmi'],
                    additional_units: [cern.id],
                    additional_units_domains: ['inc'],
                    additional_units_groups: ['inc'],
                    additional_units_institutes_domains: ['in2p3'],
                    additional_units_institutes_groups: ['in2p3'],
                    primary_institute: institute54.id,
                    primary_institute_domains: ['insu'],
                    primary_institute_groups: ['insu'],
                    additional_institutes: [institute53.id],
                    additional_institutes_domains: ['in2p3'],
                    additional_institutes_groups: ['in2p3'],
                    domains: ['insb', 'inshs'],
                    groups: ['insb', 'inshs'],
                    all_domains: ['insu', 'in2p3', 'inee', 'insmi', 'inc', 'insb', 'inshs'],
                    all_groups: ['insu', 'in2p3', 'inee', 'insmi', 'inc', 'insb', 'inshs']
                }, {
                    id: john.id,
                    totalcount: '3',
                    uid: 'john.doe',
                    name: 'doe',
                    firstname: 'john',
                    mail: 'john@doe.com',
                    cnrs: false,
                    comment: 'john comment',
                    last_connexion: today,
                    primary_unit: cern.id,
                    primary_unit_domains: ['inc'],
                    primary_unit_groups: ['inc'],
                    primary_unit_institutes_domains: ['in2p3'],
                    primary_unit_institutes_groups: ['in2p3'],
                    additional_units: [inist.id],
                    additional_units_domains: ['inee'],
                    additional_units_groups: ['inee'],
                    additional_units_institutes_domains: ['insu', 'insmi'],
                    additional_units_institutes_groups: ['insu', 'insmi'],
                    primary_institute: institute53.id,
                    primary_institute_domains: ['in2p3'],
                    primary_institute_groups: ['in2p3'],
                    additional_institutes: [institute54.id],
                    additional_institutes_domains: ['insu'],
                    additional_institutes_groups: ['insu'],
                    domains: ['insb', 'in2p3'],
                    groups: ['insb', 'in2p3'],
                    all_domains: ['in2p3', 'insu', 'inc', 'inee', 'insmi', 'insb'],
                    all_groups: ['in2p3', 'insu', 'inc', 'inee', 'insmi', 'insb']
                }, {
                    id: will.id,
                    totalcount: '3',
                    uid: 'will.doe',
                    name: 'doe',
                    firstname: 'will',
                    mail: 'will@doe.com',
                    cnrs: false,
                    comment: 'will comment',
                    last_connexion: today,
                    primary_unit: null,
                    primary_unit_domains: [],
                    primary_unit_groups: [],
                    additional_units: [],
                    additional_units_domains: [],
                    additional_units_groups: [],
                    additional_units_institutes_domains: [],
                    additional_units_institutes_groups: [],
                    primary_institute: null,
                    primary_institute_domains: [],
                    primary_institute_groups: [],
                    primary_unit_institutes_domains: [],
                    primary_unit_institutes_groups: [],
                    additional_institutes: [],
                    additional_institutes_domains: [],
                    additional_institutes_groups: [],
                    domains: ['insu', 'in2p3'],
                    groups: ['insu', 'in2p3'],
                    all_domains: ['insu', 'in2p3'],
                    all_groups: ['insu', 'in2p3']
                }
            ]);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });

    });

    describe('upsertOnePerUid', function () {

        it('should create a new janusAccount if none exists with the same code', function* () {
            const primaryInstitute = yield fixtureLoader.createInstitute();
            const user = yield janusAccountQueries.upsertOnePerUid({
                uid: 'john.doe',
                name: 'doe',
                firstname: 'john',
                mail: 'john@doe.com',
                cnrs: true,
                last_connexion: today,
                primary_institute: primaryInstitute.id
            });
            assert.deepEqual(user, {
                id: user.id,
                uid: 'john.doe',
                name: 'doe',
                firstname: 'john',
                mail: 'john@doe.com',
                cnrs: true,
                last_connexion: today,
                primary_institute: primaryInstitute.id,
                primary_unit: null
            });

            const insertedJanusAccount = yield postgres.queryOne({
                sql: 'SELECT id, uid, name, firstname, mail, cnrs, last_connexion, primary_institute, primary_unit from janus_account WHERE uid=$uid',
                parameters: { uid: 'john.doe'}
            });
            assert.deepEqual(insertedJanusAccount, user);
        });

        it('should update existing institute with the same code', function* () {
            const primaryInstitute = yield fixtureLoader.createInstitute();
            const previousJanusAccount = yield fixtureLoader.createJanusAccount({
                uid: 'john.doe',
                name: 'doe',
                firstname: 'john',
                mail: 'john@doe.com',
                cnrs: true,
                last_connexion: today,
                primary_institute: primaryInstitute.id
            });

            const user = yield janusAccountQueries.upsertOnePerUid({
                uid: 'john.doe',
                name: 'doe',
                firstname: 'johnny',
                mail: 'johnny@doe.com',
                cnrs: false,
                last_connexion: today,
                primary_institute: null
            });

            assert.deepEqual(user, {
                id: user.id,
                uid: 'john.doe',
                name: 'doe',
                firstname: 'johnny',
                mail: 'johnny@doe.com',
                cnrs: false,
                last_connexion: today,
                primary_institute: null,
                primary_unit: null
            });

            const updatedJanusAccount = yield postgres.queryOne({
                sql: 'SELECT id, uid, name, firstname, mail, cnrs, last_connexion, primary_institute, primary_unit from janus_account WHERE id=$id',
                parameters: { id: previousJanusAccount.id }
            });
            assert.deepEqual(updatedJanusAccount, user);
            assert.notEqual(updatedJanusAccount.primary_institute, previousJanusAccount.primary_institute);
        });
    });

    describe('updateDomains', function () {
        let janusAccount, insb, inc, inshs;

        beforeEach(function* () {
            [insb, inc, inshs] = yield ['insb', 'inc', 'inshs']
            .map(name => fixtureLoader.createDomain({ name }));

            yield fixtureLoader.createJanusAccount({ uid: 'john', domains: ['insb', 'inc']});
            janusAccount = yield postgres.queryOne({ sql: 'SELECT * FROM janus_account WHERE uid=$uid', parameters: { uid: 'john' }});
        });

        it('should throw an error if trying to add a domain which does not exists and abort modification', function* () {
            let error;
            try {
                yield janusAccountQueries.updateDomains(['nemo', 'inshs'], janusAccount.id);
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Domains nemo does not exists');

            const janusAccountDomains = yield postgres.queries({
                sql: 'SELECT * FROM janus_account_domain WHERE janus_account_id=$id ORDER BY index ASC',
                parameters: { id: janusAccount.id }
            });
            assert.deepEqual(janusAccountDomains, [
                { janus_account_id: janusAccount.id, domain_id: insb.id, index: 0 },
                { janus_account_id: janusAccount.id, domain_id: inc.id, index: 1 }
            ]);
        });

        it('should add given new domain', function* () {
            yield janusAccountQueries.updateDomains(['insb', 'inc', 'inshs'], janusAccount.id);

            const janusAccountDomains = yield postgres.queries({
                sql: 'SELECT * FROM janus_account_domain WHERE janus_account_id=$id ORDER BY index ASC',
                parameters: { id: janusAccount.id }
            });
            assert.deepEqual(janusAccountDomains, [
                { janus_account_id: janusAccount.id, domain_id: insb.id, index: 0 },
                { janus_account_id: janusAccount.id, domain_id: inc.id, index: 1 },
                { janus_account_id: janusAccount.id, domain_id: inshs.id, index: 2 }
            ]);
        });

        it('should remove missing domain', function* () {
            yield janusAccountQueries.updateDomains(['insb'], janusAccount.id);

            const janusAccountDomains = yield postgres.queries({
                sql: 'SELECT * FROM janus_account_domain WHERE janus_account_id=$id ORDER BY index ASC',
                parameters: { id: janusAccount.id }
            });
            assert.deepEqual(janusAccountDomains, [
                { janus_account_id: janusAccount.id, domain_id: insb.id, index: 0 }
            ]);
        });

        it('should update janus_account_domain index', function* () {
            yield janusAccountQueries.updateDomains(['inc', 'insb'], janusAccount.id);

            const janusAccountDomains = yield postgres.queries({
                sql: 'SELECT * FROM janus_account_domain WHERE janus_account_id=$id ORDER BY index ASC',
                parameters: { id: janusAccount.id }
            });
            assert.deepEqual(janusAccountDomains, [
                { janus_account_id: janusAccount.id, domain_id: inc.id, index: 0 },
                { janus_account_id: janusAccount.id, domain_id: insb.id, index: 1 }
            ]);
        });
    });

    describe('updateAdditionalInstitutes', function () {
        let janusAccount, institute53, institute54, institute55;

        beforeEach(function* () {
            [institute53, institute54, institute55] = yield ['53', '54', '55']
            .map(code => fixtureLoader.createInstitute({ code, name: `Institute ${code}` }));

            yield fixtureLoader.createJanusAccount({ uid: 'john', additional_institutes: [institute53.id, institute54.id]});
            janusAccount = yield postgres.queryOne({ sql: 'SELECT * FROM janus_account WHERE uid=$uid', parameters: { uid: 'john' }});
        });

        it('should throw an error if trying to add an institute which does not exists and abort modification', function* () {
            let error;
            try {
                yield janusAccountQueries.updateAdditionalInstitutes([0, institute55.id], janusAccount.id);
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Institutes 0 does not exists');

            const janusAccountInstitutes = yield postgres.queries({
                sql: 'SELECT * FROM janus_account_institute WHERE janus_account_id=$id ORDER BY index ASC',
                parameters: { id: janusAccount.id }
            });
            assert.deepEqual(janusAccountInstitutes, [
                { janus_account_id: janusAccount.id, institute_id: institute53.id, index: 0 },
                { janus_account_id: janusAccount.id, institute_id: institute54.id, index: 1 }
            ]);
        });

        it('should add given new institute', function* () {
            yield janusAccountQueries.updateAdditionalInstitutes([institute53.id, institute54.id, institute55.id], janusAccount.id);

            const janusAccountInstitutes = yield postgres.queries({
                sql: 'SELECT * FROM janus_account_institute WHERE janus_account_id=$id ORDER BY index ASC',
                parameters: { id: janusAccount.id }
            });
            assert.deepEqual(janusAccountInstitutes, [
                { janus_account_id: janusAccount.id, institute_id: institute53.id, index: 0 },
                { janus_account_id: janusAccount.id, institute_id: institute54.id, index: 1 },
                { janus_account_id: janusAccount.id, institute_id: institute55.id, index: 2 }
            ]);
        });

        it('should remove missing institute', function* () {
            yield janusAccountQueries.updateAdditionalInstitutes([institute53.id], janusAccount.id);

            const janusAccountInstitutes = yield postgres.queries({
                sql: 'SELECT * FROM janus_account_institute WHERE janus_account_id=$id ORDER BY index ASC',
                parameters: { id: janusAccount.id }
            });
            assert.deepEqual(janusAccountInstitutes, [
                { janus_account_id: janusAccount.id, institute_id: institute53.id, index: 0 }
            ]);
        });

        it('should update janus_account_institute index', function* () {
            yield janusAccountQueries.updateAdditionalInstitutes([institute54.id, institute53.id], janusAccount.id);

            const janusAccountInstitutes = yield postgres.queries({
                sql: 'SELECT * FROM janus_account_institute WHERE janus_account_id=$id ORDER BY index ASC',
                parameters: { id: janusAccount.id }
            });
            assert.deepEqual(janusAccountInstitutes, [
                { janus_account_id: janusAccount.id, institute_id: institute54.id, index: 0 },
                { janus_account_id: janusAccount.id, institute_id: institute53.id, index: 1 }
            ]);
        });
    });

    describe('updateAdditionalUnits', function () {
        let janusAccount, cern, inist, cnrs;

        beforeEach(function* () {
            [cern, inist, cnrs] = yield ['cern', 'inist', 'cnrs']
            .map(code => fixtureLoader.createUnit({ code }));

            yield fixtureLoader.createJanusAccount({ uid: 'john', additional_units: [cern.id, inist.id]});
            janusAccount = yield postgres.queryOne({ sql: 'SELECT * FROM janus_account WHERE uid=$uid', parameters: { uid: 'john' }});
        });

        it('should throw an error if trying to add a unit which does not exists and abort modification', function* () {
            let error;
            try {
                yield janusAccountQueries.updateAdditionalUnits([0, cnrs.id], janusAccount.id);
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Units 0 does not exists');

            const janusAccountUnits = yield postgres.queries({
                sql: 'SELECT * FROM janus_account_unit WHERE janus_account_id=$id ORDER BY index ASC',
                parameters: { id: janusAccount.id }
            });
            assert.deepEqual(janusAccountUnits, [
                { janus_account_id: janusAccount.id, unit_id: cern.id, index: 0 },
                { janus_account_id: janusAccount.id, unit_id: inist.id, index: 1 }
            ]);
        });

        it('should add given new units', function* () {
            yield janusAccountQueries.updateAdditionalUnits([cern.id, inist.id, cnrs.id], janusAccount.id);

            const janusAccountUnits = yield postgres.queries({
                sql: 'SELECT * FROM janus_account_unit WHERE janus_account_id=$id ORDER BY index ASC',
                parameters: { id: janusAccount.id }
            });
            assert.deepEqual(janusAccountUnits, [
                { janus_account_id: janusAccount.id, unit_id: cern.id, index: 0 },
                { janus_account_id: janusAccount.id, unit_id: inist.id, index: 1 },
                { janus_account_id: janusAccount.id, unit_id: cnrs.id, index: 2 }
            ]);
        });

        it('should remove missing units', function* () {
            yield janusAccountQueries.updateAdditionalUnits([cern.id], janusAccount.id);

            const janusAccountUnits = yield postgres.queries({
                sql: 'SELECT * FROM janus_account_unit WHERE janus_account_id=$id ORDER BY index ASC',
                parameters: { id: janusAccount.id }
            });
            assert.deepEqual(janusAccountUnits, [
                { janus_account_id: janusAccount.id, unit_id: cern.id, index: 0 }
            ]);
        });

        it('should update janus_account_unit index', function* () {
            yield janusAccountQueries.updateAdditionalUnits([inist.id, cern.id], janusAccount.id);

            const janusAccountUnits = yield postgres.queries({
                sql: 'SELECT * FROM janus_account_unit WHERE janus_account_id=$id ORDER BY index ASC',
                parameters: { id: janusAccount.id }
            });
            assert.deepEqual(janusAccountUnits, [
                { janus_account_id: janusAccount.id, unit_id: inist.id, index: 0 },
                { janus_account_id: janusAccount.id, unit_id: cern.id, index: 1 }
            ]);
        });
    });

    describe('selectEzTicketGroupsForIdQuery', function () {
        let user, institute53, institute54, institute55, cern, inist;

        before(function* () {
            yield ['in2p3', 'inc', 'inee', 'inp', 'ins2i', 'insb', 'inshs', 'insis', 'insmi', 'insu']
            .map(name => fixtureLoader.createDomain({ name, gate: name }));

            const instituteDomain = {
                53: 'in2p3',
                54: 'insu',
                55: 'insmi'
            };

            [institute53, institute54, institute55] = yield [53, 54, 55]
            .map(code => fixtureLoader.createInstitute({ code, name: `Institute${code}`, domains: [instituteDomain[code]]}));

            [cern, inist] = yield ['cern', 'inist']
            .map((code) => fixtureLoader.createUnit({ code, domains: [code === 'cern' ? 'inc' : 'inee'], institutes: [institute55.id] }));

            user = yield fixtureLoader.createJanusAccount({
                uid: 'uid',
                name: 'doe',
                firstname: 'jane',
                mail: 'jane@doe.com',
                cnrs: false,
                comment: 'no comment',
                last_connexion: today,
                domains: ['insb', 'inshs'],
                primary_institute: institute54.id,
                additional_institutes: [institute53.id],
                primary_unit: inist.id,
                additional_units: [cern.id]
            });
        });

        it('should return groups for ez-ticket', function* () {
            assert.deepEqual(yield janusAccountQueries.selectEzTicketGroupsForIdQuery(user.id), [
                'insu',
                'in2p3',
                'inee',
                'insmi',
                'inc',
                'insb',
                'inshs',
                'O_OTHER',
                'OU_inist',
                'I_54'
            ]);
        });
    });

    afterEach(function* () {
        yield fixtureLoader.clear();
    });

});
