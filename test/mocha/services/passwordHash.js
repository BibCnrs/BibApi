import { generateSalt, hashPassword, isPasswordValid } from '../../../lib/services/passwordHash';

describe('passwordHash', function () {

    describe('generateSalt', function () {

        it('should generate a string of 20 characters', function* () {
            const salt = yield generateSalt();
            assert.isString(salt);
            assert.equal(salt.length, 28);
        });

        it('should not generate the same string twice', function* () {
            const salt1 = yield generateSalt();
            const salt2 = yield generateSalt();
            assert.notEqual(salt1, salt2);
        });
    });

    describe('hashPassword', function () {

        it('should return a string', function* () {
            const hash = yield hashPassword('foo', 'bar');
            assert.isString(hash);
        });

        it('should return a different string than the password', function* () {
            const hash = yield hashPassword('foo', 'bar');
            assert.notEqual(hash, 'foo');
        });

        it('should return always the same string', function* () {
            const hash1 = yield hashPassword('foo', 'bar');
            const hash2 = yield hashPassword('foo', 'bar');
            assert.equal(hash1, hash2);
        });

        it('should return different strings for different salts', function* () {
            const hash1 = yield hashPassword('foo', 'bar1');
            const hash2 = yield hashPassword('foo', 'bar2');
            assert.notEqual(hash1, hash2);
        });
    });

    describe('isPasswordValid', function () {

        it('should return true for valid passwords', function* () {
            const hash = yield hashPassword('foo', 'bar');
            assert.isTrue(yield isPasswordValid('foo', 'bar', hash));
        });

        it('should return false for invalid passwords', function* () {
            const hash2 = yield hashPassword('foo2', 'bar');
            assert.isFalse(yield isPasswordValid('foo1', 'bar', hash2));
        });
    });

});
