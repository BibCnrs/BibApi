import AdminUser from '../../../lib/models/AdminUser';

describe('model AdminUser', function () {

    describe('Authenticate', function () {

        before(function* () {
            yield fixtureLoader.createAdminUser({ username: 'john', password: 'secret'});
        });

        it('should return user if given good password', function* () {
            let result = yield AdminUser.authenticate('john', 'secret');
            assert.equal(result.get('username'), 'john');
        });

        it('should return false if given wrong password', function* () {
            let result = yield AdminUser.authenticate('john', 'wrong');

            assert.isFalse(result);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('update', function () {
        let adminUser;

        beforeEach(function* () {
            yield fixtureLoader.createAdminUser({ username: 'john', password: 'secret'});
            adminUser = (yield AdminUser.findOne({ username: 'john' })).toObject();
        });

        it('should update adminUser without touching password if none is provided', function* () {
            yield AdminUser.findOneAndUpdate({username: 'john' }, { username: 'johnny' });

            const updatedUser = (yield AdminUser.findOne({ username: 'johnny' })).toObject();

            assert.deepEqual(updatedUser, {
                ...adminUser,
                username: 'johnny'
            });
        });

        it('should hash password ang generate new salt if password is provided', function* () {
            yield AdminUser.findOneAndUpdate({username: 'john' }, { password: 'betterSecret' });

            const updatedUser = (yield AdminUser.findOne({ username: 'john' })).toObject();

            assert.notEqual(updatedUser.password, adminUser.password);
            assert.notEqual(updatedUser.salt, adminUser.salt);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('create', function () {

        it('should hash password ang generate salt', function* () {
            const adminUser = (yield AdminUser.create({username: 'john', password: 'secret' })).toObject();

            assert.equal(adminUser.username, 'john');
            assert.isNotNull(adminUser.salt);
            assert.notEqual(adminUser.password, 'secret');
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

});
