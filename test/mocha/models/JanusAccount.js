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
        let in2p3, inc, inee, insb, inshs, insmi, insu;

        before(function* () {
            [in2p3, inc, inee, insb, inshs, insmi, insu] = yield ['in2p3', 'inc', 'inee', 'insb', 'inshs', 'insmi', 'insu', 'inp', 'ins2i', 'insis']
            .map(name => fixtureLoader.createCommunity({ name, gate: name }));

            const instituteCommunity = {
                53: in2p3.id,
                54: insu.id,
                55: insmi.id
            };

            [institute53, institute54, institute55] = yield [53, 54, 55]
            .map(code => fixtureLoader.createInstitute({ code, name: `Institute${code}`, communities: [instituteCommunity[code]]}));

            [cern, inist] = yield ['cern', 'inist']
            .map((code) => fixtureLoader.createUnit({ code, communities: [code === 'cern' ? inc.id : inee.id], institutes: [institute55.id] }));

            user = yield fixtureLoader.createJanusAccount({
                uid: 'uid',
                name: 'doe',
                firstname: 'jane',
                mail: 'jane@doe.com',
                cnrs: true,
                comment: 'no comment',
                last_connexion: today,
                communities: [insb.id, inshs.id],
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
                primary_unit_communities: [inee.id],
                additional_units: [cern.id],
                primary_institute: institute54.id,
                primary_institute_communities: [insu.id],
                additional_institutes: [institute53.id],
                communities: [insb.id, inshs.id],
                all_communities: [insu.id, inee.id, insb.id, inshs.id]
            });
        });

        after(function* () {
            yield fixtureLoader.clear();
        });

    });

    describe('selectPage', function () {
        let john, jane, will, institute53, institute54, institute55, cern, inist;
        let in2p3, inc, inee, insb, inshs, insmi, insu;

        before(function* () {
            [in2p3, inc, inee, insb, inshs, insmi, insu] = yield ['in2p3', 'inc', 'inee', 'insb', 'inshs', 'insmi', 'insu', 'inp', 'ins2i', 'insis']
            .map(name => fixtureLoader.createCommunity({ name, gate: name }));


            const instituteCommunities = {
                53: [in2p3.id],
                54: [insu.id],
                55: [insmi.id]
            };
            [institute53, institute54, institute55] = yield [53, 54, 55]
            .map(code => fixtureLoader.createInstitute({ code, name: `Institute${code}`, communities: instituteCommunities[code] }));

            const unitInstitutes = {
                cern: [institute53.id],
                inist: [institute54.id, institute55.id]
            };
            [cern, inist] = yield ['cern', 'inist']
            .map((code) => fixtureLoader.createUnit({ code, communities: [code === 'cern' ? inc.id : inee.id], institutes: unitInstitutes[code] }));

            jane = yield fixtureLoader.createJanusAccount({
                uid: 'jane.doe',
                name: 'doe',
                firstname: 'jane',
                mail: 'jane@doe.com',
                cnrs: true,
                last_connexion: today,
                comment: 'jane comment',
                communities: [insb.id, inshs.id],
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
                communities: [insb.id, in2p3.id],
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
                communities: [insu.id, in2p3.id],
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
                    primary_unit_communities: [inee.id],
                    additional_units: [cern.id],
                    primary_institute: institute54.id,
                    primary_institute_communities: [insu.id],
                    additional_institutes: [institute53.id],
                    communities: [insb.id, inshs.id],
                    all_communities: [insu.id, inee.id, insb.id, inshs.id]
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
                    primary_unit_communities: [inc.id],
                    additional_units: [inist.id],
                    primary_institute: institute53.id,
                    primary_institute_communities: [in2p3.id],
                    additional_institutes: [institute54.id],
                    communities: [insb.id, in2p3.id],
                    all_communities: [in2p3.id, inc.id, insb.id]
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
                    primary_unit_communities: [],
                    additional_units: [],
                    primary_institute: null,
                    primary_institute_communities: [],
                    additional_institutes: [],
                    communities: [insu.id, in2p3.id],
                    all_communities: [insu.id, in2p3.id]
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

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('updateCommunities', function () {
        let janusAccount, insb, inc, inshs;

        beforeEach(function* () {
            [insb, inc, inshs] = yield ['insb', 'inc', 'inshs']
            .map(name => fixtureLoader.createCommunity({ name }));

            yield fixtureLoader.createJanusAccount({ uid: 'john', communities: [insb.id, inc.id]});
            janusAccount = yield postgres.queryOne({ sql: 'SELECT * FROM janus_account WHERE uid=$uid', parameters: { uid: 'john' }});
        });

        it('should throw an error if trying to add a community which does not exists and abort modification', function* () {
            let error;
            try {
                yield janusAccountQueries.updateCommunities(['nemo', inshs.id], janusAccount.id);
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Communities nemo does not exists');

            const janusAccountCommunities = yield postgres.queries({
                sql: 'SELECT * FROM janus_account_community WHERE janus_account_id=$id ORDER BY index ASC',
                parameters: { id: janusAccount.id }
            });
            assert.deepEqual(janusAccountCommunities, [
                { janus_account_id: janusAccount.id, community_id: insb.id, index: 0 },
                { janus_account_id: janusAccount.id, community_id: inc.id, index: 1 }
            ]);
        });

        it('should add given new community', function* () {
            yield janusAccountQueries.updateCommunities([insb.id, inc.id, inshs.id], janusAccount.id);

            const janusAccountCommunities = yield postgres.queries({
                sql: 'SELECT * FROM janus_account_community WHERE janus_account_id=$id ORDER BY index ASC',
                parameters: { id: janusAccount.id }
            });
            assert.deepEqual(janusAccountCommunities, [
                { janus_account_id: janusAccount.id, community_id: insb.id, index: 0 },
                { janus_account_id: janusAccount.id, community_id: inc.id, index: 1 },
                { janus_account_id: janusAccount.id, community_id: inshs.id, index: 2 }
            ]);
        });

        it('should remove missing community', function* () {
            yield janusAccountQueries.updateCommunities([insb.id], janusAccount.id);

            const janusAccountCommunities = yield postgres.queries({
                sql: 'SELECT * FROM janus_account_community WHERE janus_account_id=$id ORDER BY index ASC',
                parameters: { id: janusAccount.id }
            });
            assert.deepEqual(janusAccountCommunities, [
                { janus_account_id: janusAccount.id, community_id: insb.id, index: 0 }
            ]);
        });

        it('should update janus_account_community index', function* () {
            yield janusAccountQueries.updateCommunities([inc.id, insb.id], janusAccount.id);

            const janusAccountCommunities = yield postgres.queries({
                sql: 'SELECT * FROM janus_account_community WHERE janus_account_id=$id ORDER BY index ASC',
                parameters: { id: janusAccount.id }
            });
            assert.deepEqual(janusAccountCommunities, [
                { janus_account_id: janusAccount.id, community_id: inc.id, index: 0 },
                { janus_account_id: janusAccount.id, community_id: insb.id, index: 1 }
            ]);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
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

        afterEach(function* () {
            yield fixtureLoader.clear();
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

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectEzTicketInfoForIdQuery', function () {
        let user, institute53, institute54, institute55, cern, inist;
        let in2p3, insmi, insu, inee, inc, insb, inshs;

        before(function* () {
            [in2p3, insmi, insu, inee, inc, insb, inshs] = yield ['in2p3', 'insmi', 'insu', 'inee', 'inc', 'insb', 'inshs', 'inp', 'ins2i', 'insis']
            .map(name => fixtureLoader.createCommunity({ name, gate: name }));

            const instituteCommunity = {
                53: in2p3.id,
                54: insu.id,
                55: insmi.id
            };

            [institute53, institute54, institute55] = yield [53, 54, 55]
            .map(code => fixtureLoader.createInstitute({ code, name: `Institute${code}`, communities: [instituteCommunity[code]]}));

            [cern, inist] = yield ['cern', 'inist']
            .map((code) => fixtureLoader.createUnit({ code, communities: [code === 'cern' ? inc.id : inee.id], institutes: [institute55.id] }));

            user = yield fixtureLoader.createJanusAccount({
                uid: 'uid',
                name: 'doe',
                firstname: 'jane',
                mail: 'jane@doe.com',
                cnrs: false,
                comment: 'no comment',
                last_connexion: today,
                communities: [insb.id, inshs.id],
                primary_institute: institute54.id,
                additional_institutes: [institute53.id],
                primary_unit: inist.id,
                additional_units: [cern.id]
            });
        });

        it('should return groups for ez-ticket', function* () {
            assert.deepEqual(yield janusAccountQueries.selectEzTicketInfoForIdQuery(user.id), {
                username: user.mail,
                groups: [
                    'insu',
                    'inee',
                    'insb',
                    'inshs',
                    'O_OTHER',
                    'OU_inist',
                    'I_54'
                ]
            });
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });
});
