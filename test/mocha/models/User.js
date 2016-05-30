import User from '../../../lib/models/User';
import Domain from '../../../lib/models/Domain';

describe.only('model User', function () {
    let userQueries, domainQueries;

    before(function () {
        userQueries = User(postgres);
        domainQueries = Domain(postgres);
    });

    describe('selectOne', function () {
        let user;

        before(function* () {
            yield fixtureLoader.createDomain({ name: 'vie', gate: 'insb'});
            yield fixtureLoader.createDomain({ name: 'shs', gate: 'inshs'});
            yield fixtureLoader.createDomain({ name: 'nuclear', gate: 'in2p3'});
            yield fixtureLoader.createDomain({ name: 'universe', gate: 'insu'});
            user = yield fixtureLoader.createUser({ username: 'jane', domains: ['vie', 'shs']});
        });

        it ('should return one user by id', function* () {

            assert.deepEqual(yield userQueries.selectOne({ id: user.id }), {
                id: user.id,
                username: 'jane',
                unit: null,
                institute: null,
                domains: ['vie', 'shs']
            });
        });

        after(function* () {
            yield fixtureLoader.clear();
        });

    });

    describe('selectPage', function () {
        let john, jane, will;
        before(function* () {
            yield fixtureLoader.createDomain({ name: 'vie', gate: 'insb'});
            yield fixtureLoader.createDomain({ name: 'shs', gate: 'inshs'});
            yield fixtureLoader.createDomain({ name: 'universe', gate: 'insu'});
            yield fixtureLoader.createDomain({ name: 'nuclear', gate: 'in2p3'});
            jane = yield fixtureLoader.createUser({ username: 'jane', domains: ['vie', 'shs']});
            john = yield fixtureLoader.createUser({ username: 'john', domains: ['vie', 'nuclear']});
            will = yield fixtureLoader.createUser({ username: 'will', domains: ['universe', 'nuclear']});
        });

        it ('should return one user by id', function* () {

            assert.deepEqual(yield userQueries.selectPage(), [
                {
                    id: jane.id,
                    totalcount: '3',
                    username: 'jane',
                    unit: null,
                    institute: null,
                    domains: ['shs', 'vie']
                }, {
                    id: john.id,
                    totalcount: '3',
                    username: 'john',
                    unit: null,
                    institute: null,
                    domains: ['nuclear', 'vie']
                }, {
                    id: will.id,
                    totalcount: '3',
                    username: 'will',
                    unit: null,
                    institute: null,
                    domains: ['nuclear', 'universe']
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
        let user, insb, inc, inshs;

        beforeEach(function* () {
            [insb, inc, inshs] = yield ['insb', 'inc', 'inshs']
            .map(name => fixtureLoader.createDomain({ name }));

            yield fixtureLoader.createUser({ username: 'john', password: 'secret', domains: ['insb', 'inc']});
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

        it('should throw an error if trying to add a domain which does not exists and abort modification', function* () {
            let error;
            try {
                yield userQueries.updateOne(user.id, { domains: ['nemo', 'inshs'] });
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Domains nemo does not exists');
            const userDomains = yield domainQueries.selectByUser(user);
            assert.deepEqual(userDomains, [inc, insb].map(d => ({ ...d, totalcount: '2', bib_user_id: user.id })));
        });

        it('should add given new domain', function* () {
            yield userQueries.updateOne(user.id, { domains: ['insb', 'inc', 'inshs'] });

            const userDomains = yield domainQueries.selectByUser(user);
            assert.deepEqual(userDomains, [inc, insb, inshs].map(d => ({ ...d, totalcount: '3', bib_user_id: user.id })));
        });

        it('should remove missing domain', function* () {
            yield userQueries.updateOne(user.id, { domains: ['insb'] });

            const userDomains = yield domainQueries.selectByUser(user);
            assert.deepEqual(userDomains, [insb].map(d => ({ ...d, totalcount: '1', bib_user_id: user.id })));
        });
    });

    describe('insertOne', function () {
        let insb, inc;

        beforeEach(function* () {
            [insb, inc] = yield ['insb', 'inc']
            .map(name => fixtureLoader.createDomain({ name }));
        });

        it('should insert one entity with hashed password and salt and do not return password nor salt', function* () {
            const result = yield userQueries.insertOne({ username: 'john', password: 'secret' });
            assert.deepEqual(result, { id: result.id, username: 'john', institute: null, unit: null });

            const insertedUser = yield postgres.queryOne({sql: 'SELECT * from bib_user WHERE id=$id', parameters: { id: result.id } });
            assert.notEqual(insertedUser.password, 'secret');
            assert.isNotNull(insertedUser.salt);
        });

        it('should not add salt if no password provided', function* () {
            const result = yield userQueries.insertOne({ username: 'john' });
            assert.deepEqual(result, { id: result.id, username: 'john', institute: null, unit: null });

            const insertedUser = yield postgres.queryOne({sql: 'SELECT * from bib_user WHERE id=$id', parameters: { id: result.id } });
            assert.isNull(insertedUser.password);
            assert.isNull(insertedUser.salt);
        });

        it('should add given domains if they exists', function* () {
            const user = yield userQueries.insertOne({ username: 'john', domains: ['insb', 'inc'] });

            const userDomains = yield domainQueries.selectByUser(user);
            assert.deepEqual(userDomains, [inc, insb].map(domain => ({ ...domain, totalcount: '2', bib_user_id: user.id })));
        });

        it('should throw an error if trying to insert a user with domain that do not exists', function* () {
            let error;
            try {
                yield userQueries.insertOne({ username: 'john', domains: ['insb', 'nemo'] });
            } catch (e) {
                error = e;
            }
            assert.equal(error.message, 'Domains nemo does not exists');

            const insertedUser = yield postgres.queryOne({sql: 'SELECT * from bib_user WHERE username=$username', parameters: { username: 'john'} });
            assert.isUndefined(insertedUser);
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
                { id: result[0].id, username: 'john', institute: null, unit: null },
                { id: result[1].id, username: 'jane', institute: null, unit: null }
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
                { id: result[0].id, username: 'john', institute: null, unit: null },
                { id: result[1].id, username: 'jane', institute: null, unit: null }
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
            const johnDomains = yield domainQueries.selectByUser(john);
            assert.deepEqual(johnDomains, [inc, insb].map(domain => ({ ...domain, totalcount: '2', bib_user_id: john.id })));

            const janeDomains = yield domainQueries.selectByUser(jane);
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

    afterEach(function* () {
        yield fixtureLoader.clear();
    });

});
