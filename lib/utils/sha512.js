import crypto from 'crypto';

export default function sha512(value) {
    return crypto
        .createHash('sha512')
        .update(value)
        .digest('hex')
        .toUpperCase();
}
