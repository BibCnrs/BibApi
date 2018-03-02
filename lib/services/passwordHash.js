import crypto from 'crypto';
import promisify from 'es6-promisify';

const randomBytes = promisify(crypto.randomBytes);
const pbkdf2 = promisify(crypto.pbkdf2);

export function* generateSalt() {
    return (yield randomBytes(20)).toString('base64');
}

export function* hashPassword(password, salt) {
    return (yield pbkdf2(
        new Buffer(password, 'utf-8'),
        new Buffer(salt, 'utf-8'),
        7,
        20,
        'sha256',
    )).toString('base64');
}

export function* isPasswordValid(password, salt, hash) {
    if (!salt || !hash) {
        return false;
    }
    const hashedPassword = yield hashPassword(password, salt);

    return hashedPassword == hash;
}
