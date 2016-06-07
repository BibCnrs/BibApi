import InistAccount from '../../../lib/models/InistAccount';
import Domain from '../../../lib/models/Domain';
import Institute from '../../../lib/models/Institute';
import Unit from '../../../lib/models/Unit';

describe('model InistAccount', function () {
    let inistAccountQueries, domainQueries, instituteQueries, unitQueries;

    before(function () {
        inistAccountQueries = InistAccount(postgres);
        domainQueries = Domain(postgres);
        instituteQueries = Institute(postgres);
        unitQueries = Unit(postgres);
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

            user = yield fixtureLoader.createInistAccount({
                username: 'jane_doe',
                name: 'doe',
                firstname: 'jane',
                mail: 'jane@doe.mail',
                phone: '0606060606',
                dr: 'dr54',
                domains: ['insb', 'inshs'],
                institutes: [institute53.id],
                subscription_date: '2010-12-12',
                expiration_date: '2018-12-12',
                units: [cern.id],
                comment: 'a comment'
            });
        });

        it('should return one user by id', function* () {

            assert.deepEqual(yield inistAccountQueries.selectOne({ id: user.id }), {
                id: user.id,
                username: 'jane_doe',
                name: 'doe',
                firstname: 'jane',
                mail: 'jane@doe.mail',
                phone: '0606060606',
                dr: 'dr54',
                subscription_date: new Date('2010-12-12'),
                expiration_date: new Date('2018-12-12'),
                comment: 'a comment',
                domains: ['insb', 'inshs'],
                institutes: [institute53.id],
                units: [cern.id],
                units_domains: ['inc'],
                units_institutes_domains: ['insmi'],
                institutes_domains: ['in2p3']
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
                subscription_date: new Date('2010-12-12'),
                domains: ['insb', 'inshs'],
                institutes: [institute53.id],
                units: [cern.id]
            });

            john = yield fixtureLoader.createInistAccount({
                username: 'john',
                subscription_date: new Date('2010-12-12'),
                domains: ['insb', 'in2p3'],
                institutes: [institute54.id],
                units: [inist.id]
            });

            will = yield fixtureLoader.createInistAccount({
                username: 'will',
                subscription_date: new Date('2010-12-12'),
                domains: ['insu', 'in2p3'],
                institutes: [],
                units: []
            });
        });

        it ('should return one user by id', function* () {

            assert.deepEqual(yield inistAccountQueries.selectPage(), [
                {
                    id: jane.id,
                    totalcount: '3',
                    username: 'jane',
                    firstname: null,
                    name: null,
                    mail: null,
                    phone: null,
                    dr: null,
                    subscription_date: new Date('2010-12-12'),
                    expiration_date: null,
                    comment: null,
                    units: [cern.id],
                    units_domains: ['inc'],
                    units_institutes_domains: ['in2p3'],
                    institutes: [institute53.id],
                    institutes_domains: ['in2p3'],
                    domains: ['insb', 'inshs']
                }, {
                    id: john.id,
                    totalcount: '3',
                    username: 'john',
                    firstname: null,
                    name: null,
                    mail: null,
                    phone: null,
                    dr: null,
                    subscription_date: new Date('2010-12-12'),
                    expiration_date: null,
                    comment: null,
                    units: [inist.id],
                    units_domains: ['inee'],
                    units_institutes_domains: ['insu', 'insmi'],
                    institutes: [institute54.id],
                    institutes_domains: ['insu'],
                    domains: ['in2p3', 'insb']
                }, {
                    id: will.id,
                    totalcount: '3',
                    username: 'will',
                    firstname: null,
                    name: null,
                    mail: null,
                    phone: null,
                    dr: null,
                    subscription_date: new Date('2010-12-12'),
                    expiration_date: null,
                    comment: null,
                    units: [],
                    units_domains: [],
                    units_institutes_domains: [],
                    institutes: [],
                    institutes_domains: [],
                    domains: ['in2p3', 'insu']
                }
            ]);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });

    });

    describe('Authenticate', function () {

        before(function* () {
            yield fixtureLoader.createInistAccount({ username: 'john', password: 'secret' });
            yield fixtureLoader.createInistAccount({ username: 'jane' });
        });

        it('should return user if given good password', function* () {
            let result = yield inistAccountQueries.authenticate('john', 'secret');
            assert.equal(result.username, 'john');
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

    describe('updateOne', function () {
        let inistAccount;

        beforeEach(function* () {
            yield fixtureLoader.createInistAccount({ username: 'john', password: 'secret', domains: []});
            inistAccount = yield postgres.queryOne({ sql: 'SELECT * FROM inist_account WHERE username=$username', parameters: { username: 'john' }});
        });

        it('should update inistAccount without touching password if none is provided', function* () {
            yield inistAccountQueries.updateOne(inistAccount.id, { username: 'johnny' });

            const updatedInistAccount = yield postgres.queryOne({ sql: 'SELECT * FROM inist_account WHERE username=$username', parameters: { username: 'johnny' }});

            assert.deepEqual(updatedInistAccount, {
                ...inistAccount,
                username: 'johnny'
            });
        });

        it('should hash password and generate new salt if password is provided', function* () {
            yield inistAccountQueries.updateOne(inistAccount.id, { password: 'betterSecret' });

            const updatedInistAccount = yield postgres.queryOne({ sql: 'SELECT * FROM inist_account WHERE id=$id', parameters: inistAccount});

            assert.notEqual(updatedInistAccount.password, inistAccount.password);
            assert.notEqual(updatedInistAccount.salt, inistAccount.salt);
        });
    });

    describe('insertOne', function () {

        it('should insert one entity with hashed password and salt and do not return password nor salt', function* () {
            const result = yield inistAccountQueries.insertOne({ username: 'john', password: 'secret', subscription_date: new Date('2015-12-04') });
            assert.deepEqual(result, {
                id: result.id,
                username: 'john',
                name: null,
                firstname: null,
                mail: null,
                phone: null,
                dr: null,
                comment: null,
                subscription_date: new Date('2015-12-04'),
                expiration_date: null,
                domains: [],
                institutes: [],
                units: []
            });

            const insertedInistAccount = yield postgres.queryOne({sql: 'SELECT * from inist_account WHERE id=$id', parameters: { id: result.id } });
            assert.notEqual(insertedInistAccount.password, 'secret');
            assert.isNotNull(insertedInistAccount.salt);
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
            const userDomains = yield domainQueries.selectByInistAccountId(inistAccount.id);
            assert.deepEqual(userDomains, [inc, insb].map(d => ({ ...d, totalcount: '2', inist_account_id: inistAccount.id })));
        });

        it('should add given new domain', function* () {
            yield inistAccountQueries.updateDomains(['insb', 'inc', 'inshs'], inistAccount.id);

            const userDomains = yield domainQueries.selectByInistAccountId(inistAccount.id);
            assert.deepEqual(userDomains, [inc, insb, inshs].map(d => ({ ...d, totalcount: '3', inist_account_id: inistAccount.id })));
        });

        it('should remove missing domain', function* () {
            yield inistAccountQueries.updateDomains(['insb'], inistAccount.id);

            const userDomains = yield domainQueries.selectByInistAccountId(inistAccount.id);
            assert.deepEqual(userDomains, [insb].map(d => ({ ...d, totalcount: '1', inist_account_id: inistAccount.id })));
        });
    });

    describe('updateInstitutes', function () {
        let user, institute53, institute54, institute55;

        beforeEach(function* () {
            [institute53, institute54, institute55] = yield ['53', '54', '55']
            .map(code => fixtureLoader.createInstitute({ code, name: `Institute ${code}` }));

            yield fixtureLoader.createInistAccount({ username: 'john', password: 'secret', institutes: [institute53.id, institute54.id]});
            user = yield postgres.queryOne({ sql: 'SELECT * FROM inist_account WHERE username=$username', parameters: { username: 'john' }});
        });

        it('should throw an error if trying to add a domain which does not exists and abort modification', function* () {
            let error;
            try {
                yield inistAccountQueries.updateInstitutes([0, institute55.id], user.id);
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Institutes 0 does not exists');
            const userInstitutes = yield instituteQueries.selectByInistAccountId(user.id);
            assert.deepEqual(userInstitutes, [institute53, institute54].map(institute => ({
                id: institute.id,
                code: institute.code,
                name: institute.name,
                totalcount: '2',
                inist_account_id: user.id
            })));
        });

        it('should add given new domain', function* () {
            yield inistAccountQueries.updateInstitutes([institute53.id, institute54.id, institute55.id], user.id);

            const userInstitutes = yield instituteQueries.selectByInistAccountId(user.id);
            assert.deepEqual(userInstitutes, [institute53, institute54, institute55].map(institute => ({
                id: institute.id,
                code: institute.code,
                name: institute.name,
                totalcount: '3',
                inist_account_id: user.id
            })));
        });

        it('should remove missing domain', function* () {
            yield inistAccountQueries.updateInstitutes([institute53.id], user.id);

            const userInstitutes = yield instituteQueries.selectByInistAccountId(user.id);
            assert.deepEqual(userInstitutes, [institute53].map(institute => ({
                id: institute.id,
                code: institute.code,
                name: institute.name,
                totalcount: '1',
                inist_account_id: user.id
            })));
        });
    });

    describe('updateUnits', function () {
        let user, cern, inist, cnrs;

        beforeEach(function* () {
            [cern, inist, cnrs] = yield ['cern', 'inist', 'cnrs']
            .map(code => fixtureLoader.createUnit({ code }));

            yield fixtureLoader.createInistAccount({ username: 'john', password: 'secret', units: [cern.id, inist.id]});
            user = yield postgres.queryOne({ sql: 'SELECT * FROM inist_account WHERE username=$username', parameters: { username: 'john' }});
        });

        it('should throw an error if trying to add a domain which does not exists and abort modification', function* () {
            let error;
            try {
                yield inistAccountQueries.updateUnits([0, cnrs.id], user.id);
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Units 0 does not exists');
            const userUnits = yield unitQueries.selectByInistAccountId(user.id);
            assert.deepEqual(userUnits, [cern, inist].map(unit => ({
                id: unit.id,
                code: unit.code,
                totalcount: '2',
                inist_account_id: user.id
            })));
        });

        it('should add given new domain', function* () {
            yield inistAccountQueries.updateUnits([cern.id, inist.id, cnrs.id], user.id);

            const userUnits = yield unitQueries.selectByInistAccountId(user.id);
            assert.deepEqual(userUnits, [cern, cnrs, inist].map(unit => ({
                id: unit.id,
                code: unit.code,
                totalcount: '3',
                inist_account_id: user.id
            })));
        });

        it('should remove missing domain', function* () {
            yield inistAccountQueries.updateUnits([cern.id], user.id);

            const userUnits = yield unitQueries.selectByInistAccountId(user.id);
            assert.deepEqual(userUnits, [cern].map(unit => ({
                id: unit.id,
                code: unit.code,
                totalcount: '1',
                inist_account_id: user.id
            })));
        });
    });

    afterEach(function* () {
        yield fixtureLoader.clear();
    });

});
