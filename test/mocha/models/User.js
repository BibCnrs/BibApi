import User from '../../../lib/models/User';
import Domain from '../../../lib/models/Domain';

describe('model User', function () {
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
                username: 'jane',
                password: null,
                salt: null,
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

        before(function* () {
            yield fixtureLoader.createDomain({ name: 'vie', gate: 'insb'});
            yield fixtureLoader.createDomain({ name: 'shs', gate: 'inshs'});
            yield fixtureLoader.createDomain({ name: 'universe', gate: 'insu'});
            yield fixtureLoader.createDomain({ name: 'nuclear', gate: 'in2p3'});
            yield fixtureLoader.createUser({ username: 'jane', domains: ['vie', 'shs']});
            yield fixtureLoader.createUser({ username: 'john', domains: ['vie', 'nuclear']});
            yield fixtureLoader.createUser({ username: 'will', domains: ['universe', 'nuclear']});
        });

        it ('should return one user by id', function* () {

            assert.deepEqual(yield userQueries.selectPage(), [
                {
                    totalcount: '3',
                    username: 'jane',
                    unit: null,
                    institute: null,
                    domains: ['shs', 'vie']
                }, {
                    totalcount: '3',
                    username: 'john',
                    unit: null,
                    institute: null,
                    domains: ['nuclear', 'vie']
                }, {
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
            yield fixtureLoader.createUser({ username: 'john', password: 'secret'});
        });

        it('should return user if given good password', function* () {
            let result = yield userQueries.authenticate('john', 'secret');
            assert.equal(result.username, 'john');
        });

        it('should return false if given wrong password', function* () {
            let result = yield userQueries.authenticate('john', 'wrong');

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
            assert.deepEqual(userDomains, [inc, insb].map(d => ({ ...d, totalcount: '2' })));
        });

        it('should add given new domain', function* () {
            yield userQueries.updateOne(user.id, { domains: ['insb', 'inc', 'inshs'] });

            const userDomains = yield domainQueries.selectByUser(user);
            assert.deepEqual(userDomains, [inc, insb, inshs].map(d => ({ ...d, totalcount: '3' })));
        });

        it('should remove missing domain', function* () {
            yield userQueries.updateOne(user.id, { domains: ['insb'] });

            const userDomains = yield domainQueries.selectByUser(user);
            assert.deepEqual(userDomains, [insb].map(d => ({ ...d, totalcount: '1' })));
        });
    });

    afterEach(function* () {
        yield fixtureLoader.clear();
    });

});
