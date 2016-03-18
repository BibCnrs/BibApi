import crypto from 'crypto';

export default function sha512(value, key) {
    const hash = crypto.createHmac('sha512', key);
    hash.update(value);

    return hash.digest('hex');
}
