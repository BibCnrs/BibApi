import {
    authenticate,
    getInistAccount,
    selectEzTicketInfoForId,
    selectOne,
    updateCommunities,
    updateInstitutes,
    updateUnits,
} from '../../../lib/models/InistAccount';

describe('model InistAccount', function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    describe('selectOne', function () {
        let user,
            institute53,
            institute55,
            cern,
            insb,
            inshs,
            in2p3,
            inc,
            insmi,
            insu,
            inee;

        before(function* () {
            [insb, inshs, in2p3, inc, insmi, insu, inee] = yield [
                'insb',
                'inshs',
                'in2p3',
                'inc',
                'insmi',
                'insu',
                'inee',
                'inp',
                'ins2i',
                'insis',
            ].map((name) =>
                fixtureLoader.createCommunity({
                    name,
                    gate: name,
                }),
            );

            const instituteCommunity = {
                53: in2p3.id,
                54: insu.id,
                55: insmi.id,
            };

            [institute53, , institute55] = yield [53, 54, 55].map((code) =>
                fixtureLoader.createInstitute({
                    code,
                    name: `Institute${code}`,
                    communities: [instituteCommunity[code]],
                }),
            );

            [cern] = yield ['cern', 'inist'].map((code) =>
                fixtureLoader.createUnit({
                    code,
                    communities: [code === 'cern' ? inc.id : inee.id],
                    institutes: [institute55.id],
                }),
            );

            user = yield fixtureLoader.createInistAccount({
                username: 'jane_doe',
                password: 'secret',
                name: 'doe',
                firstname: 'jane',
                mail: 'jane@doe.mail',
                phone: '0606060606',
                dr: 'dr54',
                communities: [inshs.id, insb.id],
                main_institute: institute53.id,
                subscription_date: '2010-12-12',
                expiration_date: '2018-12-12',
                main_unit: cern.id,
                units: [],
                comment: 'a comment',
            });
        });

        it('should return one user by id', function* () {
            assert.deepEqual(
                yield selectOne({
                    id: user.id,
                }),
                {
                    id: user.id,
                    username: 'jane_doe',
                    password: 'secret',
                    name: 'doe',
                    firstname: 'jane',
                    mail: 'jane@doe.mail',
                    phone: '0606060606',
                    dr: 'dr54',
                    subscription_date: new Date('2010-12-12'),
                    expiration_date: new Date('2018-12-12'),
                    last_connexion: today,
                    comment: 'a comment',
                    communities: [inshs.id, insb.id],
                    main_institute: institute53.id,
                    institutes: [],
                    main_unit: cern.id,
                    units: [],
                    main_unit_communities: [inc.id],
                    main_institute_communities: [in2p3.id],
                    all_communities: [in2p3.id, inc.id, inshs.id, insb.id],
                    active: true,
                },
            );
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectPage', function () {
        let john,
            jane,
            will,
            institute53,
            institute54,
            institute55,
            cern,
            inist;
        let insb, inshs, in2p3, insu, inc, inee, insmi;

        before(function* () {
            [insb, inshs, in2p3, insu, inc, inee, insmi] = yield [
                'insb',
                'inshs',
                'in2p3',
                'insu',
                'inc',
                'inee',
                'insmi',
                'inp',
                'ins2i',
                'insis',
            ].map((name) =>
                fixtureLoader.createCommunity({
                    name,
                    gate: name,
                }),
            );

            const instituteCommunities = {
                53: [in2p3.id],
                54: [insu.id],
                55: [insmi.id],
            };
            [institute53, institute54, institute55] = yield [53, 54, 55].map(
                (code) =>
                    fixtureLoader.createInstitute({
                        code,
                        name: `Institute${code}`,
                        communities: instituteCommunities[code],
                    }),
            );

            const unitInstitutes = {
                cern: [institute53.id],
                inist: [institute54.id, institute55.id],
            };
            [cern, inist] = yield ['cern', 'inist'].map((code) =>
                fixtureLoader.createUnit({
                    code,
                    communities: [code === 'cern' ? inc.id : inee.id],
                    institutes: unitInstitutes[code],
                }),
            );

            jane = yield fixtureLoader.createInistAccount({
                username: 'jane',
                password: 'secret',
                subscription_date: new Date('2010-12-12'),
                communities: [insb.id, inshs.id],
                main_institute: institute53.id,
                institutes: institute53.id,
                main_unit: cern.id,
                units: [],
            });

            john = yield fixtureLoader.createInistAccount({
                username: 'john',
                password: 'secret',
                subscription_date: new Date('2010-12-12'),
                communities: [insb.id, in2p3.id],
                main_institute: institute54.id,
                institutes: [],
                main_unit: inist.id,
                units: [],
            });

            will = yield fixtureLoader.createInistAccount({
                username: 'will',
                password: 'secret',
                subscription_date: new Date('2010-12-12'),
                communities: [insu.id, in2p3.id],
                main_institute: null,
                institutes: [institute54.id],
                main_units: null,
                units: [inist.id],
            });
        });

        it('should return users page', function* () {
            assert.deepEqual(yield getInistAccount(), [
                {
                    id: jane.id,
                    totalcount: '3',
                    username: 'jane',
                    password: 'secret',
                    firstname: null,
                    name: null,
                    mail: null,
                    phone: null,
                    dr: null,
                    subscription_date: new Date('2010-12-12'),
                    expiration_date: null,
                    last_connexion: today,
                    comment: null,
                    main_unit: cern.id,
                    units: [],
                    main_unit_communities: [inc.id],
                    main_institute: institute53.id,
                    institutes: [],
                    main_institute_communities: [in2p3.id],
                    communities: [insb.id, inshs.id],
                    all_communities: [in2p3.id, inc.id, insb.id, inshs.id],
                    active: true,
                },
                {
                    id: john.id,
                    totalcount: '3',
                    username: 'john',
                    password: 'secret',
                    firstname: null,
                    name: null,
                    mail: null,
                    phone: null,
                    dr: null,
                    subscription_date: new Date('2010-12-12'),
                    expiration_date: null,
                    last_connexion: today,
                    comment: null,
                    main_unit: inist.id,
                    units: [],
                    main_unit_communities: [inee.id],
                    main_institute: institute54.id,
                    institutes: [],
                    main_institute_communities: [insu.id],
                    communities: [insb.id, in2p3.id],
                    all_communities: [insu.id, inee.id, insb.id, in2p3.id],
                    active: true,
                },
                {
                    id: will.id,
                    totalcount: '3',
                    username: 'will',
                    password: 'secret',
                    firstname: null,
                    name: null,
                    mail: null,
                    phone: null,
                    dr: null,
                    subscription_date: new Date('2010-12-12'),
                    expiration_date: null,
                    last_connexion: today,
                    comment: null,
                    main_unit: null,
                    units: [inist.id],
                    main_unit_communities: [],
                    main_institute: null,
                    institutes: [institute54.id],
                    main_institute_communities: [],
                    communities: [insu.id, in2p3.id],
                    all_communities: [insu.id, in2p3.id],
                    active: true,
                },
            ]);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('Authenticate', function () {
        before(function* () {
            yield fixtureLoader.createInistAccount({
                username: 'john',
                password: 'secret',
            });
            yield fixtureLoader.createInistAccount({
                username: 'valid',
                password: 'secret',
                expiration_date: `${new Date().getFullYear() + 1}-12-12`,
            });
            yield fixtureLoader.createInistAccount({
                username: 'expired',
                password: 'secret',
                expiration_date: `${new Date().getFullYear() - 1}-12-12`,
            });
            yield fixtureLoader.createInistAccount({
                username: 'jane',
            });
        });

        it('should return user if given good password', function* () {
            let result = yield authenticate('john', 'secret');
            assert.equal(result.username, 'john');
        });

        it('should return user if given good password and has a future expiration_date', function* () {
            let result = yield authenticate('valid', 'secret');
            assert.equal(result.username, 'valid');
        });

        it('should return false if given good password and expiration_date is past', function* () {
            let result = yield authenticate('expired', 'secret');

            assert.isFalse(result);
        });

        it('should return false if given wrong password', function* () {
            let result = yield authenticate('john', 'wrong');

            assert.isFalse(result);
        });

        it('should return false if user has no password', function* () {
            let result = yield authenticate('jane', undefined);

            assert.isFalse(result);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('updateCommunities', function () {
        let inistAccount, insb, inc, inshs;

        beforeEach(function* () {
            [insb, inc, inshs] = yield ['insb', 'inc', 'inshs'].map((name) =>
                fixtureLoader.createCommunity({ name }),
            );

            yield fixtureLoader.createInistAccount({
                username: 'john',
                password: 'secret',
                communities: [insb.id, inc.id],
            });
            inistAccount = yield postgres.queryOne({
                sql: 'SELECT * FROM inist_account WHERE username=$username',
                parameters: { username: 'john' },
            });
        });

        it('should throw an error if trying to add a community which does not exists and abort modification', function* () {
            let error;
            try {
                yield updateCommunities(['nemo', inshs.id], inistAccount.id);
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Communities nemo does not exists');

            const inistAccountCommunities = yield postgres.queries({
                sql: 'SELECT * FROM inist_account_community WHERE inist_account_id=$id ORDER BY index ASC',
                parameters: { id: inistAccount.id },
            });
            assert.deepEqual(inistAccountCommunities, [
                {
                    inist_account_id: inistAccount.id,
                    community_id: insb.id,
                    index: 0,
                },
                {
                    inist_account_id: inistAccount.id,
                    community_id: inc.id,
                    index: 1,
                },
            ]);
        });

        it('should add given new community', function* () {
            yield updateCommunities(
                [insb.id, inc.id, inshs.id],
                inistAccount.id,
            );

            const inistAccountCommunities = yield postgres.queries({
                sql: 'SELECT * FROM inist_account_community WHERE inist_account_id=$id ORDER BY index ASC',
                parameters: { id: inistAccount.id },
            });
            assert.deepEqual(inistAccountCommunities, [
                {
                    inist_account_id: inistAccount.id,
                    community_id: insb.id,
                    index: 0,
                },
                {
                    inist_account_id: inistAccount.id,
                    community_id: inc.id,
                    index: 1,
                },
                {
                    inist_account_id: inistAccount.id,
                    community_id: inshs.id,
                    index: 2,
                },
            ]);
        });

        it('should remove missing community', function* () {
            yield updateCommunities([insb.id], inistAccount.id);

            const inistAccountCommunities = yield postgres.queries({
                sql: 'SELECT * FROM inist_account_community WHERE inist_account_id=$id ORDER BY index ASC',
                parameters: { id: inistAccount.id },
            });
            assert.deepEqual(inistAccountCommunities, [
                {
                    inist_account_id: inistAccount.id,
                    community_id: insb.id,
                    index: 0,
                },
            ]);
        });

        it('should update community index', function* () {
            yield updateCommunities([inc.id, insb.id], inistAccount.id);

            const inistAccountCommunities = yield postgres.queries({
                sql: 'SELECT * FROM inist_account_community WHERE inist_account_id=$id ORDER BY index ASC',
                parameters: { id: inistAccount.id },
            });
            assert.deepEqual(inistAccountCommunities, [
                {
                    inist_account_id: inistAccount.id,
                    community_id: inc.id,
                    index: 0,
                },
                {
                    inist_account_id: inistAccount.id,
                    community_id: insb.id,
                    index: 1,
                },
            ]);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('updateInstitutes', function () {
        let inistAccount, institute53, institute54, institute55;

        beforeEach(function* () {
            [institute53, institute54, institute55] = yield [
                '53',
                '54',
                '55',
            ].map((code) =>
                fixtureLoader.createInstitute({
                    code,
                    name: `Institute ${code}`,
                }),
            );

            yield fixtureLoader.createInistAccount({
                username: 'john',
                password: 'secret',
                institutes: [institute53.id, institute54.id],
            });
            inistAccount = yield postgres.queryOne({
                sql: 'SELECT * FROM inist_account WHERE username=$username',
                parameters: { username: 'john' },
            });
        });

        it('should throw an error if trying to add a community which does not exists and abort modification', function* () {
            let error;
            try {
                yield updateInstitutes([0, institute55.id], inistAccount.id);
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Institutes 0 does not exists');

            const inistAccountInstitutes = yield postgres.queries({
                sql: 'SELECT * FROM inist_account_institute WHERE inist_account_id=$id ORDER BY index ASC',
                parameters: { id: inistAccount.id },
            });
            assert.deepEqual(inistAccountInstitutes, [
                {
                    inist_account_id: inistAccount.id,
                    institute_id: institute53.id,
                    index: 0,
                },
                {
                    inist_account_id: inistAccount.id,
                    institute_id: institute54.id,
                    index: 1,
                },
            ]);
        });

        it('should add given new units', function* () {
            yield updateInstitutes(
                [institute53.id, institute54.id, institute55.id],
                inistAccount.id,
            );

            const inistAccountInstitutes = yield postgres.queries({
                sql: 'SELECT * FROM inist_account_institute WHERE inist_account_id=$id ORDER BY index ASC',
                parameters: { id: inistAccount.id },
            });
            assert.deepEqual(inistAccountInstitutes, [
                {
                    inist_account_id: inistAccount.id,
                    institute_id: institute53.id,
                    index: 0,
                },
                {
                    inist_account_id: inistAccount.id,
                    institute_id: institute54.id,
                    index: 1,
                },
                {
                    inist_account_id: inistAccount.id,
                    institute_id: institute55.id,
                    index: 2,
                },
            ]);
        });

        it('should remove missing units', function* () {
            yield updateInstitutes([institute53.id], inistAccount.id);

            const inistAccountInstitutes = yield postgres.queries({
                sql: 'SELECT * FROM inist_account_institute WHERE inist_account_id=$id ORDER BY index ASC',
                parameters: { id: inistAccount.id },
            });
            assert.deepEqual(inistAccountInstitutes, [
                {
                    inist_account_id: inistAccount.id,
                    institute_id: institute53.id,
                    index: 0,
                },
            ]);
        });

        it('should update institutes index', function* () {
            yield updateInstitutes(
                [institute54.id, institute53.id],
                inistAccount.id,
            );

            const inistAccountInstitutes = yield postgres.queries({
                sql: 'SELECT * FROM inist_account_institute WHERE inist_account_id=$id ORDER BY index ASC',
                parameters: { id: inistAccount.id },
            });
            assert.deepEqual(inistAccountInstitutes, [
                {
                    inist_account_id: inistAccount.id,
                    institute_id: institute54.id,
                    index: 0,
                },
                {
                    inist_account_id: inistAccount.id,
                    institute_id: institute53.id,
                    index: 1,
                },
            ]);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('updateUnits', function () {
        let inistAccount, cern, inist, cnrs;

        beforeEach(function* () {
            [cern, inist, cnrs] = yield ['cern', 'inist', 'cnrs'].map((code) =>
                fixtureLoader.createUnit({ code }),
            );

            yield fixtureLoader.createInistAccount({
                username: 'john',
                password: 'secret',
                units: [cern.id, inist.id],
            });
            inistAccount = yield postgres.queryOne({
                sql: 'SELECT * FROM inist_account WHERE username=$username',
                parameters: { username: 'john' },
            });
        });

        it('should throw an error if trying to add a community which does not exists and abort modification', function* () {
            let error;
            try {
                yield updateUnits([0, cnrs.id], inistAccount.id);
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Units 0 does not exists');

            const inistAccountUnits = yield postgres.queries({
                sql: 'SELECT * FROM inist_account_unit WHERE inist_account_id=$id ORDER BY index ASC',
                parameters: { id: inistAccount.id },
            });
            assert.deepEqual(inistAccountUnits, [
                {
                    inist_account_id: inistAccount.id,
                    unit_id: cern.id,
                    index: 0,
                },
                {
                    inist_account_id: inistAccount.id,
                    unit_id: inist.id,
                    index: 1,
                },
            ]);
        });

        it('should add given new units', function* () {
            yield updateUnits([cern.id, inist.id, cnrs.id], inistAccount.id);

            const inistAccountUnits = yield postgres.queries({
                sql: 'SELECT * FROM inist_account_unit WHERE inist_account_id=$id ORDER BY index ASC',
                parameters: { id: inistAccount.id },
            });
            assert.deepEqual(inistAccountUnits, [
                {
                    inist_account_id: inistAccount.id,
                    unit_id: cern.id,
                    index: 0,
                },
                {
                    inist_account_id: inistAccount.id,
                    unit_id: inist.id,
                    index: 1,
                },
                {
                    inist_account_id: inistAccount.id,
                    unit_id: cnrs.id,
                    index: 2,
                },
            ]);
        });

        it('should remove missing units', function* () {
            yield updateUnits([cern.id], inistAccount.id);

            const inistAccountUnits = yield postgres.queries({
                sql: 'SELECT * FROM inist_account_unit WHERE inist_account_id=$id ORDER BY index ASC',
                parameters: { id: inistAccount.id },
            });
            assert.deepEqual(inistAccountUnits, [
                {
                    inist_account_id: inistAccount.id,
                    unit_id: cern.id,
                    index: 0,
                },
            ]);
        });

        it('should update unit_institute index', function* () {
            yield updateUnits([inist.id, cern.id], inistAccount.id);

            const inistAccountUnits = yield postgres.queries({
                sql: 'SELECT * FROM inist_account_unit WHERE inist_account_id=$id ORDER BY index ASC',
                parameters: { id: inistAccount.id },
            });
            assert.deepEqual(inistAccountUnits, [
                {
                    inist_account_id: inistAccount.id,
                    unit_id: inist.id,
                    index: 0,
                },
                {
                    inist_account_id: inistAccount.id,
                    unit_id: cern.id,
                    index: 1,
                },
            ]);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectEzTicketInfoForId', function () {
        let user, institute53, institute55, cern;
        let in2p3, insu, insmi, inc, inee, inshs, insb, reaxys;

        before(function* () {
            [in2p3, insu, insmi, inc, inee, inshs, insb, reaxys] = yield [
                'in2p3',
                'insu',
                'insmi',
                'inc',
                'inee',
                'inshs',
                'insb',
                'reaxys',
                'inp',
                'ins2i',
                'insis',
            ].map((name) =>
                fixtureLoader.createCommunity({
                    name,
                    gate: name,
                    ebsco: name !== 'reaxys',
                }),
            );

            const instituteCommunity = {
                53: in2p3.id,
                54: insu.id,
                55: insmi.id,
            };

            [institute53, , institute55] = yield [53, 54, 55].map((code) =>
                fixtureLoader.createInstitute({
                    code,
                    name: `Institute${code}`,
                    communities: [instituteCommunity[code]],
                }),
            );

            [cern] = yield ['cern', 'inist'].map((code) =>
                fixtureLoader.createUnit({
                    code,
                    communities: [
                        code === 'cern' ? inc.id : inee.id,
                        reaxys.id,
                    ],
                    institutes: [institute55.id],
                }),
            );

            user = yield fixtureLoader.createInistAccount({
                username: 'jane_doe',
                password: 'secret',
                name: 'doe',
                firstname: 'jane',
                mail: 'jane@doe.mail',
                phone: '0606060606',
                dr: 'dr54',
                communities: [inshs.id, insb.id],
                main_institute: institute53.id,
                institutes: [],
                subscription_date: '2010-12-12',
                expiration_date: '2018-12-12',
                main_unit: cern.id,
                units: [],
                comment: 'a comment',
                active: true,
            });
        });

        it('should return groups for ez-ticket', function* () {
            assert.deepEqual(yield selectEzTicketInfoForId(user.id), {
                username: `${user.username}_O_UNKNOWN_I_53_OU_cern`,
                groups: ['in2p3', 'inc', 'reaxys', 'inshs', 'insb'],
            });
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });
});
