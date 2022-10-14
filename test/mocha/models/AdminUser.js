import { authenticate } from '../../../lib/controller/admin/login';
import {
    insertOne,
    selectOne,
    selectOneByUsername,
    updateOne,
} from '../../../lib/models/AdminUser';

describe('model AdminUser', function () {
    describe('Authenticate', function () {
        before(function* () {
            yield fixtureLoader.createAdminUser({
                username: 'john',
                password: 'secret',
            });
        });

        it('should return user if given good password', function* () {
            let result = yield authenticate('john', 'secret');
            assert.equal(result.username, 'john');
        });

        it('should return false if given wrong password', function* () {
            let result = yield authenticate('john', 'wrong');

            assert.isFalse(result);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('update', function () {
        let adminUser;

        beforeEach(function* () {
            adminUser = yield fixtureLoader.createAdminUser({
                username: 'john',
                password: 'secret',
            });
        });

        it('should update adminUser without touching password if none is provided', function* () {
            yield updateOne(adminUser.id, {
                username: 'johnny',
            });

            const updatedUser = yield selectOne(adminUser.id);

            assert.deepEqual(updatedUser, {
                ...adminUser,
                username: 'johnny',
            });
        });

        it('should hash password ang generate new salt if password is provided', function* () {
            yield updateOne(adminUser.id, {
                password: 'betterSecret',
            });

            const updatedUser = yield selectOneByUsername('john');

            assert.notEqual(updatedUser.password, adminUser.password);
            assert.notEqual(updatedUser.salt, adminUser.salt);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('insertOne', function () {
        it('should hash password ang generate salt', function* () {
            const adminUser = yield insertOne({
                username: 'john',
                password: 'secret',
            });

            assert.equal(adminUser.username, 'john');
            assert.isNotNull(adminUser.salt);
            assert.notEqual(adminUser.password, 'secret');
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });
});
