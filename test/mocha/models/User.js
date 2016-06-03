import User from '../../../lib/models/User';
import Domain from '../../../lib/models/Domain';
import Institute from '../../../lib/models/Institute';
import Unit from '../../../lib/models/Unit';

describe('model User', function () {
    let userQueries, domainQueries, instituteQueries, unitQueries;

    before(function () {
        userQueries = User(postgres);
        domainQueries = Domain(postgres);
        instituteQueries = Institute(postgres);
        unitQueries = Unit(postgres);
    });

    describe('selectOne', function () {
        let user, institute53, institute54, cern, inist;

        before(function* () {
            yield ['in2p3', 'inc', 'inee', 'inp', 'ins2i', 'insb', 'inshs', 'insis', 'insmi', 'insu']
            .map(name => fixtureLoader.createDomain({ name, gate: name }));

            [institute53, institute54] = yield [53, 54]
            .map(code => fixtureLoader.createInstitute({ code, name: `Institute${code}`, domains: [code === 54 ? 'insu' : 'in2p3']}));

            [cern, inist] = yield ['cern', 'inist']
            .map((code) => fixtureLoader.createUnit({ code, domains: [code === 'cern' ? 'inc' : 'inee'] }));

            user = yield fixtureLoader.createUser({
                username: 'jane',
                domains: ['insb', 'inshs'],
                primary_institute: institute54.id,
                additional_institutes: [institute53.id],
                primary_unit: inist.id,
                additional_units: [cern.id]
            });
        });

        it ('should return one user by id', function* () {

            assert.deepEqual(yield userQueries.selectOne({ id: user.id }), {
                id: user.id,
                username: 'jane',
                primary_unit: inist.id,
                primary_unit_domains: ['inee'],
                additional_units: [cern.id],
                additional_units_domains: ['inc'],
                primary_institute: institute54.id,
                primary_institute_domains: ['insu'],
                additional_institutes: [institute53.id],
                additional_institutes_domains: ['in2p3'],
                domains: ['insb', 'inshs']
            });
        });

        after(function* () {
            yield fixtureLoader.clear();
        });

    });

    describe('selectPage', function () {
        let john, jane, will, institute53, institute54, cern, inist;

        before(function* () {
            yield ['in2p3', 'inc', 'inee', 'inp', 'ins2i', 'insb', 'inshs', 'insis', 'insmi', 'insu']
            .map(name => fixtureLoader.createDomain({ name, gate: name }));

            [institute53, institute54] = yield [53, 54]
            .map(code => fixtureLoader.createInstitute({ code, name: `Institute${code}`, domains: [code === 54 ? 'insu' : 'in2p3'] }));

            [cern, inist] = yield ['cern', 'inist']
            .map((code) => fixtureLoader.createUnit({ code, domains: [code === 'cern' ? 'inc' : 'inee'] }));

            jane = yield fixtureLoader.createUser({
                username: 'jane',
                domains: ['insb', 'inshs'],
                primary_institute: institute54.id,
                additional_institutes: [institute53.id],
                primary_unit: inist.id,
                additional_units: [cern.id]
            });

            john = yield fixtureLoader.createUser({
                username: 'john',
                domains: ['insb', 'in2p3'],
                primary_institute: institute53.id,
                additional_institutes: [institute54.id],
                primary_unit: cern.id,
                additional_units: [inist.id]
            });

            will = yield fixtureLoader.createUser({
                username: 'will',
                domains: ['insu', 'in2p3'],
                primary_institute: null,
                additional_institutes: [],
                primary_unit: null,
                additional_units: []
            });
        });

        it ('should return one user by id', function* () {

            assert.deepEqual(yield userQueries.selectPage(), [
                {
                    id: jane.id,
                    totalcount: '3',
                    username: 'jane',
                    primary_unit: inist.id,
                    primary_unit_domains: ['inee'],
                    additional_units: [cern.id],
                    additional_units_domains: ['inc'],
                    primary_institute: institute54.id,
                    primary_institute_domains: ['insu'],
                    additional_institutes: [institute53.id],
                    additional_institutes_domains: ['in2p3'],
                    domains: ['insb', 'inshs']
                }, {
                    id: john.id,
                    totalcount: '3',
                    username: 'john',
                    primary_unit: cern.id,
                    primary_unit_domains: ['inc'],
                    additional_units: [inist.id],
                    additional_units_domains: ['inee'],
                    primary_institute: institute53.id,
                    primary_institute_domains: ['in2p3'],
                    additional_institutes: [institute54.id],
                    additional_institutes_domains: ['insu'],
                    domains: ['in2p3', 'insb']
                }, {
                    id: will.id,
                    totalcount: '3',
                    username: 'will',
                    primary_unit: null,
                    primary_unit_domains: [],
                    additional_units: [],
                    additional_units_domains: [],
                    primary_institute: null,
                    primary_institute_domains: [],
                    additional_institutes: [],
                    additional_institutes_domains: [],
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
            yield fixtureLoader.createUser({ username: 'john', password: 'secret' });
            yield fixtureLoader.createUser({ username: 'jane' });
        });

        it('should return user if given good password', function* () {
            let result = yield userQueries.authenticate('john', 'secret');
            assert.equal(result.username, 'john');
        });

        it('should return false if given wrong password', function* () {
            let result = yield userQueries.authenticate('john', 'wrong');

            assert.isFalse(result);
        });

        it('should return false if user has no password', function* () {
            let result = yield userQueries.authenticate('jane', undefined);

            assert.isFalse(result);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('updateOne', function () {
        let user;

        beforeEach(function* () {
            yield fixtureLoader.createUser({ username: 'john', password: 'secret', domains: []});
            user = yield postgres.queryOne({ sql: 'SELECT * FROM bib_user WHERE username=$username', parameters: { username: 'john' }});
        });

        it('should update user without touching password if none is provided', function* () {
            yield userQueries.updateOne(user.id, { username: 'johnny' });

            const updatedUser = yield postgres.queryOne({ sql: 'SELECT * FROM bib_user WHERE username=$username', parameters: { username: 'johnny' }});

            assert.deepEqual(updatedUser, {
                ...user,
                username: 'johnny'
            });
        });

        it('should hash password and generate new salt if password is provided', function* () {
            yield userQueries.updateOne(user.id, { password: 'betterSecret' });

            const updatedUser = yield postgres.queryOne({ sql: 'SELECT * FROM bib_user WHERE id=$id', parameters: user});

            assert.notEqual(updatedUser.password, user.password);
            assert.notEqual(updatedUser.salt, user.salt);
        });
    });

    describe('insertOne', function () {

        it('should insert one entity with hashed password and salt and do not return password nor salt', function* () {
            const result = yield userQueries.insertOne({ username: 'john', password: 'secret' });
            assert.deepEqual(result, {
                id: result.id,
                username: 'john',
                primary_institute: null,
                primary_unit: null,
                domains: [],
                additional_institutes: [],
                additional_units: []
            });

            const insertedUser = yield postgres.queryOne({sql: 'SELECT * from bib_user WHERE id=$id', parameters: { id: result.id } });
            assert.notEqual(insertedUser.password, 'secret');
            assert.isNotNull(insertedUser.salt);
        });

        it('should not add salt if no password provided', function* () {
            const result = yield userQueries.insertOne({ username: 'john' });
            assert.deepEqual(result, {
                id: result.id,
                username: 'john',
                primary_institute: null,
                primary_unit: null,
                domains: [],
                additional_institutes: [],
                additional_units: []
            });

            const insertedUser = yield postgres.queryOne({sql: 'SELECT * from bib_user WHERE id=$id', parameters: { id: result.id } });
            assert.isNull(insertedUser.password);
            assert.isNull(insertedUser.salt);
        });
    });

    describe('batchInsert', function () {
        let insb, inc, inshs;

        beforeEach(function* () {
            [insb, inc, inshs] = yield ['insb', 'inc', 'inshs']
            .map(name => fixtureLoader.createDomain({ name }));
        });

        it('should insert batch of entities with hashed password and salt and do not return password nor salt', function* () {
            const result = yield userQueries.batchInsert([
                { username: 'john', password: 'secret' },
                { username: 'jane', password: 'hidden' }
            ]);
            assert.deepEqual(result, [
                { id: result[0].id, username: 'john', primary_institute: null, primary_unit: null },
                { id: result[1].id, username: 'jane', primary_institute: null, primary_unit: null }
            ]);

            const insertedUser = yield postgres.queryOne({sql: 'SELECT * from bib_user WHERE id=$id', parameters: { id: result[0].id } });
            assert.notEqual(insertedUser.password, 'secret');
            assert.isNotNull(insertedUser.salt);
        });

        it('should not add salt if no password provided', function* () {
            const result = yield userQueries.batchInsert([
                { username: 'john' },
                { username: 'jane' }
            ]);
            assert.deepEqual(result, [
                { id: result[0].id, username: 'john', primary_institute: null, primary_unit: null },
                { id: result[1].id, username: 'jane', primary_institute: null, primary_unit: null }
            ]);

            const insertedUser = yield postgres.queryOne({sql: 'SELECT * from bib_user WHERE id=$id', parameters: { id: result[0].id } });
            assert.isNull(insertedUser.password);
            assert.isNull(insertedUser.salt);
        });

        it('should add given domains if they exists', function* () {
            const [john, jane] = yield userQueries.batchInsert([
                { username: 'john', domains: ['insb', 'inc'] },
                { username: 'jane', domains: ['insb', 'inshs'] }
            ]);
            const johnDomains = yield domainQueries.selectByUserId(john.id);
            assert.deepEqual(johnDomains, [inc, insb].map(domain => ({ ...domain, totalcount: '2', bib_user_id: john.id })));

            const janeDomains = yield domainQueries.selectByUserId(jane.id);
            assert.deepEqual(janeDomains, [insb, inshs].map(domain => ({ ...domain, totalcount: '2', bib_user_id: jane.id })));
        });

        it('should throw an error if trying to insert a user with domain that do not exists', function* () {
            let error;
            try {
                yield userQueries.batchInsert([
                    { username: 'john', domains: ['insb', 'nemo'] },
                    { username: 'jane', domains: ['insb', 'inshs'] }
                ]);
            } catch (e) {
                error = e;
            }
            assert.equal(error.message, 'Domains nemo does not exists');

            const insertedJohn = yield postgres.queryOne({sql: 'SELECT * from bib_user WHERE username=$username', parameters: { username: 'john'} });
            assert.isUndefined(insertedJohn);

            const insertedJane = yield postgres.queryOne({sql: 'SELECT * from bib_user WHERE username=$username', parameters: { username: 'jane'} });
            assert.isUndefined(insertedJane);
        });
    });

    describe('upsertOnePerUsername', function () {

        it('should create a new institute if none exists with the same code', function* () {
            const primaryInstitute = yield fixtureLoader.createInstitute();
            const user = yield userQueries.upsertOnePerUsername({ username: 'john', primary_institute: primaryInstitute.id });
            assert.deepEqual(user, {
                id: user.id,
                username: 'john',
                primary_institute: primaryInstitute.id,
                primary_unit: null
            });

            const insertedUser = yield postgres.queryOne({sql: 'SELECT id, username, primary_institute, primary_unit from bib_user WHERE username=$username', parameters: { username: 'john'} });
            assert.deepEqual(insertedUser, user);
        });

        it('should update existing institute with the same code', function* () {
            const primaryInstitute = yield fixtureLoader.createInstitute();
            const previousUser = yield fixtureLoader.createUser({ username: 'john', primary_institute: primaryInstitute.id });

            const user = yield userQueries.upsertOnePerUsername({ username: 'john', primary_institute: null });
            assert.deepEqual(user, {
                id: user.id,
                username: 'john',
                primary_institute: null,
                primary_unit: null
            });

            const updatedUser = yield postgres.queryOne({sql: 'SELECT id, username, primary_institute, primary_unit from bib_user WHERE id=$id', parameters: { id: previousUser.id } });
            assert.deepEqual(updatedUser, user);
            assert.notEqual(updatedUser.primary_institute, previousUser.primary_institute);
        });
    });

    describe('updateDomains', function () {
        let user, insb, inc, inshs;

        beforeEach(function* () {
            [insb, inc, inshs] = yield ['insb', 'inc', 'inshs']
            .map(name => fixtureLoader.createDomain({ name }));

            yield fixtureLoader.createUser({ username: 'john', password: 'secret', domains: ['insb', 'inc']});
            user = yield postgres.queryOne({ sql: 'SELECT * FROM bib_user WHERE username=$username', parameters: { username: 'john' }});
        });

        it('should throw an error if trying to add a domain which does not exists and abort modification', function* () {
            let error;
            try {
                yield userQueries.updateDomains(['nemo', 'inshs'], user.id);
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Domains nemo does not exists');
            const userDomains = yield domainQueries.selectByUserId(user.id);
            assert.deepEqual(userDomains, [inc, insb].map(d => ({ ...d, totalcount: '2', bib_user_id: user.id })));
        });

        it('should add given new domain', function* () {
            yield userQueries.updateDomains(['insb', 'inc', 'inshs'], user.id);

            const userDomains = yield domainQueries.selectByUserId(user.id);
            assert.deepEqual(userDomains, [inc, insb, inshs].map(d => ({ ...d, totalcount: '3', bib_user_id: user.id })));
        });

        it('should remove missing domain', function* () {
            yield userQueries.updateDomains(['insb'], user.id);

            const userDomains = yield domainQueries.selectByUserId(user.id);
            assert.deepEqual(userDomains, [insb].map(d => ({ ...d, totalcount: '1', bib_user_id: user.id })));
        });
    });

    describe('updateAdditionalInstitutes', function () {
        let user, institute53, institute54, institute55;

        beforeEach(function* () {
            [institute53, institute54, institute55] = yield ['53', '54', '55']
            .map(code => fixtureLoader.createInstitute({ code, name: `Institute ${code}` }));

            yield fixtureLoader.createUser({ username: 'john', password: 'secret', additional_institutes: [institute53.id, institute54.id]});
            user = yield postgres.queryOne({ sql: 'SELECT * FROM bib_user WHERE username=$username', parameters: { username: 'john' }});
        });

        it('should throw an error if trying to add a domain which does not exists and abort modification', function* () {
            let error;
            try {
                yield userQueries.updateAdditionalInstitutes([0, institute55.id], user.id);
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Institutes 0 does not exists');
            const userInstitutes = yield instituteQueries.selectByUserId(user.id);
            assert.deepEqual(userInstitutes, [institute53, institute54].map(institute => ({
                id: institute.id,
                code: institute.code,
                name: institute.name,
                totalcount: '2',
                bib_user_id: user.id
            })));
        });

        it('should add given new domain', function* () {
            yield userQueries.updateAdditionalInstitutes([institute53.id, institute54.id, institute55.id], user.id);

            const userInstitutes = yield instituteQueries.selectByUserId(user.id);
            assert.deepEqual(userInstitutes, [institute53, institute54, institute55].map(institute => ({
                id: institute.id,
                code: institute.code,
                name: institute.name,
                totalcount: '3',
                bib_user_id: user.id
            })));
        });

        it('should remove missing domain', function* () {
            yield userQueries.updateAdditionalInstitutes([institute53.id], user.id);

            const userInstitutes = yield instituteQueries.selectByUserId(user.id);
            assert.deepEqual(userInstitutes, [institute53].map(institute => ({
                id: institute.id,
                code: institute.code,
                name: institute.name,
                totalcount: '1',
                bib_user_id: user.id
            })));
        });
    });

    describe('updateAdditionalUnits', function () {
        let user, cern, inist, cnrs;

        beforeEach(function* () {
            [cern, inist, cnrs] = yield ['cern', 'inist', 'cnrs']
            .map(code => fixtureLoader.createUnit({ code }));

            yield fixtureLoader.createUser({ username: 'john', password: 'secret', additional_units: [cern.id, inist.id]});
            user = yield postgres.queryOne({ sql: 'SELECT * FROM bib_user WHERE username=$username', parameters: { username: 'john' }});
        });

        it('should throw an error if trying to add a domain which does not exists and abort modification', function* () {
            let error;
            try {
                yield userQueries.updateAdditionalUnits([0, cnrs.id], user.id);
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Units 0 does not exists');
            const userUnits = yield unitQueries.selectByUserId(user.id);
            assert.deepEqual(userUnits, [cern, inist].map(unit => ({
                id: unit.id,
                code: unit.code,
                totalcount: '2',
                bib_user_id: user.id
            })));
        });

        it('should add given new domain', function* () {
            yield userQueries.updateAdditionalUnits([cern.id, inist.id, cnrs.id], user.id);

            const userUnits = yield unitQueries.selectByUserId(user.id);
            assert.deepEqual(userUnits, [cern, cnrs, inist].map(unit => ({
                id: unit.id,
                code: unit.code,
                totalcount: '3',
                bib_user_id: user.id
            })));
        });

        it('should remove missing domain', function* () {
            yield userQueries.updateAdditionalUnits([cern.id], user.id);

            const userUnits = yield unitQueries.selectByUserId(user.id);
            assert.deepEqual(userUnits, [cern].map(unit => ({
                id: unit.id,
                code: unit.code,
                totalcount: '1',
                bib_user_id: user.id
            })));
        });
    });

    afterEach(function* () {
        yield fixtureLoader.clear();
    });

});
