import InistAccount from '../../../lib/models/InistAccount';

describe('model InistAccount', function () {
    let inistAccountQueries;

    before(function () {
        inistAccountQueries = InistAccount(postgres);
    });

    describe('selectOne', function () {
        let user, institute53, institute55, cern;

        before(function* () {
            yield ['in2p3', 'inc', 'inee', 'inp', 'ins2i', 'insb', 'inshs', 'insis', 'insmi', 'insu']
            .map(name => fixtureLoader.createDomain({ name, gate: name }));

            const instituteDomain = {
                53: 'in2p3',
                54: 'insu',
                55: 'insmi'
            };

            [institute53, , institute55] = yield [53, 54, 55]
            .map(code => fixtureLoader.createInstitute({ code, name: `Institute${code}`, domains: [instituteDomain[code]]}));

            [cern] = yield ['cern', 'inist']
            .map((code) => fixtureLoader.createUnit({ code, domains: [code === 'cern' ? 'inc' : 'inee'], institutes: [institute55.id] }));

            user = yield fixtureLoader.createInistAccount({
                username: 'jane_doe',
                password: 'secret',
                name: 'doe',
                firstname: 'jane',
                mail: 'jane@doe.mail',
                phone: '0606060606',
                dr: 'dr54',
                domains: ['inshs', 'insb'],
                main_institute: institute53.id,
                subscription_date: '2010-12-12',
                expiration_date: '2018-12-12',
                main_unit: cern.id,
                units: [],
                comment: 'a comment'
            });
        });

        it('should return one user by id', function* () {

            assert.deepEqual(yield inistAccountQueries.selectOne({ id: user.id }), {
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
                comment: 'a comment',
                domains: ['inshs', 'insb'],
                groups: ['inshs', 'insb'],
                main_institute: institute53.id,
                institutes: [],
                main_unit: cern.id,
                units: [],
                main_unit_domains: ['inc'],
                main_unit_groups: ['inc'],
                main_institute_domains: ['in2p3'],
                main_institute_groups: ['in2p3'],
                all_domains: ['in2p3', 'inc', 'inshs', 'insb'],
                all_groups: ['in2p3', 'inc', 'inshs', 'insb']
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

            jane = yield fixtureLoader.createInistAccount({
                username: 'jane',
                password: 'secret',
                subscription_date: new Date('2010-12-12'),
                domains: ['insb', 'inshs'],
                main_institute: institute53.id,
                institutes: institute53.id,
                main_unit: cern.id,
                units: []
            });

            john = yield fixtureLoader.createInistAccount({
                username: 'john',
                password: 'secret',
                subscription_date: new Date('2010-12-12'),
                domains: ['insb', 'in2p3'],
                main_institute: institute54.id,
                institutes: [],
                main_unit: inist.id,
                units: []
            });

            will = yield fixtureLoader.createInistAccount({
                username: 'will',
                password: 'secret',
                subscription_date: new Date('2010-12-12'),
                domains: ['insu', 'in2p3'],
                main_institute: null,
                institutes: [institute54.id],
                main_units: null,
                units: [inist.id]
            });
        });

        it ('should return users page', function* () {

            assert.deepEqual(yield inistAccountQueries.selectPage(), [
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
                    comment: null,
                    main_unit: cern.id,
                    units: [],
                    main_unit_domains: ['inc'],
                    main_unit_groups: ['inc'],
                    main_institute: institute53.id,
                    institutes: [],
                    main_institute_domains: ['in2p3'],
                    main_institute_groups: ['in2p3'],
                    domains: ['insb', 'inshs'],
                    groups: ['insb', 'inshs'],
                    all_domains: ['in2p3', 'inc', 'insb', 'inshs'],
                    all_groups: ['in2p3', 'inc', 'insb', 'inshs']
                }, {
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
                    comment: null,
                    main_unit: inist.id,
                    units: [],
                    main_unit_domains: ['inee'],
                    main_unit_groups: ['inee'],
                    main_institute: institute54.id,
                    institutes: [],
                    main_institute_domains: ['insu'],
                    main_institute_groups: ['insu'],
                    domains: ['insb', 'in2p3'],
                    groups: ['insb', 'in2p3'],
                    all_domains: ['insu', 'inee', 'insb', 'in2p3'],
                    all_groups: ['insu', 'inee', 'insb', 'in2p3']
                }, {
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
                    comment: null,
                    main_unit: null,
                    units: [inist.id],
                    main_unit_domains: [],
                    main_unit_groups: [],
                    main_institute: null,
                    institutes: [institute54.id],
                    main_institute_domains: [],
                    main_institute_groups: [],
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

    describe('Authenticate', function () {

        beforeEach(function* () {
            yield fixtureLoader.createInistAccount({ username: 'john', password: 'secret' });
            yield fixtureLoader.createInistAccount({ username: 'valid', password: 'secret', expiration_date: `${new Date().getFullYear() + 1}-12-12` });
            yield fixtureLoader.createInistAccount({ username: 'expired', password: 'secret', expiration_date: `${new Date().getFullYear() - 1}-12-12` });
            yield fixtureLoader.createInistAccount({ username: 'jane' });
        });

        it('should return user if given good password', function* () {
            let result = yield inistAccountQueries.authenticate('john', 'secret');
            assert.equal(result.username, 'john');
        });

        it('should return user if given good password and has a future expiration_date', function* () {
            let result = yield inistAccountQueries.authenticate('valid', 'secret');
            assert.equal(result.username, 'valid');
        });

        it('should return false if given good password and expiration_date is past', function* () {
            let result = yield inistAccountQueries.authenticate('expired', 'secret');

            assert.isFalse(result);
        });

        it('should return false if given wrong password', function* () {
            let result = yield inistAccountQueries.authenticate('john', 'wrong');

            assert.isFalse(result);
        });

        it('should return false if user has no password', function* () {
            let result = yield inistAccountQueries.authenticate('jane', undefined);

            assert.isFalse(result);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('updateDomains', function () {
        let inistAccount, insb, inc, inshs;

        beforeEach(function* () {
            [insb, inc, inshs] = yield ['insb', 'inc', 'inshs']
            .map(name => fixtureLoader.createDomain({ name }));

            yield fixtureLoader.createInistAccount({ username: 'john', password: 'secret', domains: ['insb', 'inc']});
            inistAccount = yield postgres.queryOne({ sql: 'SELECT * FROM inist_account WHERE username=$username', parameters: { username: 'john' }});
        });

        it('should throw an error if trying to add a domain which does not exists and abort modification', function* () {
            let error;
            try {
                yield inistAccountQueries.updateDomains(['nemo', 'inshs'], inistAccount.id);
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Domains nemo does not exists');

            const inistAccountDomains = yield postgres.queries({
                sql: 'SELECT * FROM inist_account_domain WHERE inist_account_id=$id ORDER BY index ASC',
                parameters: { id: inistAccount.id }
            });
            assert.deepEqual(inistAccountDomains, [
                { inist_account_id: inistAccount.id, domain_id: insb.id, index: 0 },
                { inist_account_id: inistAccount.id, domain_id: inc.id, index: 1 }
            ]);
        });

        it('should add given new domain', function* () {
            yield inistAccountQueries.updateDomains(['insb', 'inc', 'inshs'], inistAccount.id);

            const inistAccountDomains = yield postgres.queries({
                sql: 'SELECT * FROM inist_account_domain WHERE inist_account_id=$id ORDER BY index ASC',
                parameters: { id: inistAccount.id }
            });
            assert.deepEqual(inistAccountDomains, [
                { inist_account_id: inistAccount.id, domain_id: insb.id, index: 0 },
                { inist_account_id: inistAccount.id, domain_id: inc.id, index: 1 },
                { inist_account_id: inistAccount.id, domain_id: inshs.id, index: 2 }
            ]);
        });

        it('should remove missing domain', function* () {
            yield inistAccountQueries.updateDomains(['insb'], inistAccount.id);

            const inistAccountDomains = yield postgres.queries({
                sql: 'SELECT * FROM inist_account_domain WHERE inist_account_id=$id ORDER BY index ASC',
                parameters: { id: inistAccount.id }
            });
            assert.deepEqual(inistAccountDomains, [
                { inist_account_id: inistAccount.id, domain_id: insb.id, index: 0 }
            ]);
        });

        it('should update domain index', function* () {
            yield inistAccountQueries.updateDomains(['inc', 'insb'], inistAccount.id);

            const inistAccountDomains = yield postgres.queries({
                sql: 'SELECT * FROM inist_account_domain WHERE inist_account_id=$id ORDER BY index ASC',
                parameters: { id: inistAccount.id }
            });
            assert.deepEqual(inistAccountDomains, [
                { inist_account_id: inistAccount.id, domain_id: inc.id, index: 0 },
                { inist_account_id: inistAccount.id, domain_id: insb.id, index: 1 }
            ]);
        });
    });

    describe('updateInstitutes', function () {
        let inistAccount, institute53, institute54, institute55;

        beforeEach(function* () {
            [institute53, institute54, institute55] = yield ['53', '54', '55']
            .map(code => fixtureLoader.createInstitute({ code, name: `Institute ${code}` }));

            yield fixtureLoader.createInistAccount({ username: 'john', password: 'secret', institutes: [institute53.id, institute54.id]});
            inistAccount = yield postgres.queryOne({ sql: 'SELECT * FROM inist_account WHERE username=$username', parameters: { username: 'john' }});
        });

        it('should throw an error if trying to add a domain which does not exists and abort modification', function* () {
            let error;
            try {
                yield inistAccountQueries.updateInstitutes([0, institute55.id], inistAccount.id);
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Institutes 0 does not exists');

            const inistAccountInstitutes = yield postgres.queries({
                sql: 'SELECT * FROM inist_account_institute WHERE inist_account_id=$id ORDER BY index ASC',
                parameters: { id: inistAccount.id }
            });
            assert.deepEqual(inistAccountInstitutes, [
                { inist_account_id: inistAccount.id, institute_id: institute53.id, index: 0 },
                { inist_account_id: inistAccount.id, institute_id: institute54.id, index: 1 }
            ]);
        });

        it('should add given new units', function* () {
            yield inistAccountQueries.updateInstitutes([institute53.id, institute54.id, institute55.id], inistAccount.id);

            const inistAccountInstitutes = yield postgres.queries({
                sql: 'SELECT * FROM inist_account_institute WHERE inist_account_id=$id ORDER BY index ASC',
                parameters: { id: inistAccount.id }
            });
            assert.deepEqual(inistAccountInstitutes, [
                { inist_account_id: inistAccount.id, institute_id: institute53.id, index: 0 },
                { inist_account_id: inistAccount.id, institute_id: institute54.id, index: 1 },
                { inist_account_id: inistAccount.id, institute_id: institute55.id, index: 2 }
            ]);
        });

        it('should remove missing units', function* () {
            yield inistAccountQueries.updateInstitutes([institute53.id], inistAccount.id);

            const inistAccountInstitutes = yield postgres.queries({
                sql: 'SELECT * FROM inist_account_institute WHERE inist_account_id=$id ORDER BY index ASC',
                parameters: { id: inistAccount.id }
            });
            assert.deepEqual(inistAccountInstitutes, [
                { inist_account_id: inistAccount.id, institute_id: institute53.id, index: 0 }
            ]);
        });

        it('should update institutes index', function* () {
            yield inistAccountQueries.updateInstitutes([institute54.id, institute53.id], inistAccount.id);

            const inistAccountInstitutes = yield postgres.queries({
                sql: 'SELECT * FROM inist_account_institute WHERE inist_account_id=$id ORDER BY index ASC',
                parameters: { id: inistAccount.id }
            });
            assert.deepEqual(inistAccountInstitutes, [
                { inist_account_id: inistAccount.id, institute_id: institute54.id, index: 0 },
                { inist_account_id: inistAccount.id, institute_id: institute53.id, index: 1 }
            ]);
        });
    });

    describe('updateUnits', function () {
        let inistAccount, cern, inist, cnrs;

        beforeEach(function* () {
            [cern, inist, cnrs] = yield ['cern', 'inist', 'cnrs']
            .map(code => fixtureLoader.createUnit({ code }));

            yield fixtureLoader.createInistAccount({ username: 'john', password: 'secret', units: [cern.id, inist.id]});
            inistAccount = yield postgres.queryOne({ sql: 'SELECT * FROM inist_account WHERE username=$username', parameters: { username: 'john' }});
        });

        it('should throw an error if trying to add a domain which does not exists and abort modification', function* () {
            let error;
            try {
                yield inistAccountQueries.updateUnits([0, cnrs.id], inistAccount.id);
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Units 0 does not exists');

            const inistAccountUnits = yield postgres.queries({
                sql: 'SELECT * FROM inist_account_unit WHERE inist_account_id=$id ORDER BY index ASC',
                parameters: { id: inistAccount.id }
            });
            assert.deepEqual(inistAccountUnits, [
                { inist_account_id: inistAccount.id, unit_id: cern.id, index: 0 },
                { inist_account_id: inistAccount.id, unit_id: inist.id, index: 1 }
            ]);
        });

        it('should add given new units', function* () {
            yield inistAccountQueries.updateUnits([cern.id, inist.id, cnrs.id], inistAccount.id);

            const inistAccountUnits = yield postgres.queries({
                sql: 'SELECT * FROM inist_account_unit WHERE inist_account_id=$id ORDER BY index ASC',
                parameters: { id: inistAccount.id }
            });
            assert.deepEqual(inistAccountUnits, [
                { inist_account_id: inistAccount.id, unit_id: cern.id, index: 0 },
                { inist_account_id: inistAccount.id, unit_id: inist.id, index: 1 },
                { inist_account_id: inistAccount.id, unit_id: cnrs.id, index: 2 }
            ]);
        });

        it('should remove missing units', function* () {
            yield inistAccountQueries.updateUnits([cern.id], inistAccount.id);

            const inistAccountUnits = yield postgres.queries({
                sql: 'SELECT * FROM inist_account_unit WHERE inist_account_id=$id ORDER BY index ASC',
                parameters: { id: inistAccount.id }
            });
            assert.deepEqual(inistAccountUnits, [
                { inist_account_id: inistAccount.id, unit_id: cern.id, index: 0 }
            ]);
        });

        it('should update unit_institute index', function* () {
            yield inistAccountQueries.updateUnits([inist.id, cern.id], inistAccount.id);

            const inistAccountUnits = yield postgres.queries({
                sql: 'SELECT * FROM inist_account_unit WHERE inist_account_id=$id ORDER BY index ASC',
                parameters: { id: inistAccount.id }
            });
            assert.deepEqual(inistAccountUnits, [
                { inist_account_id: inistAccount.id, unit_id: inist.id, index: 0 },
                { inist_account_id: inistAccount.id, unit_id: cern.id, index: 1 }
            ]);
        });
    });

    describe('selectEzTicketInfoForIdQuery', function () {
        let user, institute53, institute55, cern;

        before(function* () {
            yield ['in2p3', 'inc', 'inee', 'inp', 'ins2i', 'insb', 'inshs', 'insis', 'insmi', 'insu']
            .map(name => fixtureLoader.createDomain({ name, gate: name }));

            const instituteDomain = {
                53: 'in2p3',
                54: 'insu',
                55: 'insmi'
            };

            [institute53, , institute55] = yield [53, 54, 55]
            .map(code => fixtureLoader.createInstitute({ code, name: `Institute${code}`, domains: [instituteDomain[code]]}));

            [cern] = yield ['cern', 'inist']
            .map((code) => fixtureLoader.createUnit({ code, domains: [code === 'cern' ? 'inc' : 'inee'], institutes: [institute55.id] }));

            user = yield fixtureLoader.createInistAccount({
                username: 'jane_doe',
                password: 'secret',
                name: 'doe',
                firstname: 'jane',
                mail: 'jane@doe.mail',
                phone: '0606060606',
                dr: 'dr54',
                domains: ['inshs', 'insb'],
                main_institute: institute53.id,
                institutes: [],
                subscription_date: '2010-12-12',
                expiration_date: '2018-12-12',
                main_unit: cern.id,
                units: [],
                comment: 'a comment'
            });
        });

        it('should return groups for ez-ticket', function* () {
            assert.deepEqual(yield inistAccountQueries.selectEzTicketInfoForIdQuery(user.id), {
                username: user.username,
                groups: [
                    'in2p3',
                    'inc',
                    'inshs',
                    'insb',
                    'O_CNRS',
                    'OU_cern',
                    'I_53'
                ]
            });
        });
    });

    afterEach(function* () {
        yield fixtureLoader.clear();
    });

});
