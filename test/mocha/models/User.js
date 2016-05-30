import User from '../../../lib/models/User';

describe('model User', function () {
    let userQueries;

    before(function () {
        userQueries = User(postgres);
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

    describe.only('Authenticate', function () {

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

    describe('update', function () {
        let user;

        beforeEach(function* () {
            yield fixtureLoader.createUser({ username: 'john', password: 'secret'});
            user = (yield User.findOne({ username: 'john' })).toObject();
        });

        it('should update user without touching password if none is provided', function* () {
            yield User.findOneAndUpdate({username: 'john' }, { username: 'johnny' });

            const updatedUser = (yield User.findOne({ username: 'johnny' })).toObject();

            assert.deepEqual(updatedUser, {
                ...user,
                username: 'johnny'
            });
        });

        it('should hash password ang generate new salt if password is provided', function* () {
            yield User.findOneAndUpdate({username: 'john' }, { password: 'betterSecret' });

            const updatedUser = (yield User.findOne({ username: 'john' })).toObject();

            assert.notEqual(updatedUser.password, user.password);
            assert.notEqual(updatedUser.salt, user.salt);
        });

        it('should throw an error if trying to add a domain which does not exists', function* () {
            let error;
            try {
                yield User.findOneAndUpdate({username: 'john' }, { domains: ['nemo'] });
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Domain { name: nemo } does not exists');
        });

        it('should throw an error if trying to add a additionalInstitutes which does not exists', function* () {
            let error;
            try {
                yield User.findOneAndUpdate({username: 'john' }, { additionalInstitutes: ['nemo'] });
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Institute { code: nemo } does not exists');
        });

        it('should throw an error if trying to add a primaryInstitute which does not exists', function* () {
            let error;
            try {
                yield User.findOneAndUpdate({username: 'john' }, { primaryInstitute: 'nemo' });
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Institute { code: nemo } does not exists');
        });

        it('should throw an error if trying to add an additionalUnits which does not exists', function* () {
            let error;
            try {
                yield User.findOneAndUpdate({username: 'john' }, { additionalUnits: ['nemo'] });
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Unit { name: nemo } does not exists');
        });

        it('should throw an error if trying to add a primaryUnit which does not exists', function* () {
            let error;
            try {
                yield User.findOneAndUpdate({username: 'john' }, { primaryUnit: 'nemo' });
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Unit { name: nemo } does not exists');
        });
    });

    afterEach(function* () {
        yield fixtureLoader.clear();
    });

});
