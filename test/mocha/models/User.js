import User from '../../../lib/models/User';

describe('model User', function () {

    describe('Authenticate', function () {

        before(function* () {
            yield fixtureLoader.createUser({ username: 'john', password: 'secret'});
        });

        it('should return user if given good password', function* () {
            let result = yield User.authenticate('john', 'secret');
            assert.equal(result.get('username'), 'john');
        });

        it('should return false if given wrong password', function* () {
            let result = yield User.authenticate('john', 'wrong');

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

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('create', function () {

        it('should hash password ang generate salt', function* () {
            const user = (yield User.create({username: 'john', password: 'secret' })).toObject();

            assert.equal(user.username, 'john');
            assert.isNotNull(user.salt);
            assert.notEqual(user.password, 'secret');
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('gates', function () {
        let jane;
        before(function* () {
            yield fixtureLoader.createDomain({ name: 'vie', gate: 'insb'});
            yield fixtureLoader.createDomain({ name: 'shs', gate: 'inshs'});
            yield fixtureLoader.createUser({ username: 'jane', password: 'secret', domains: ['vie', 'shs']});

            jane = yield User.findOne({ username: 'jane' });
        });

        it('should return list of gates corresponding to domains', function* () {
            assert.deepEqual(yield jane.gatesPromises, ['insb', 'inshs']);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

});
