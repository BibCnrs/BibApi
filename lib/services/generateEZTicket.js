import { EZproxy } from 'config';
import sha512 from '../utils/sha512';

export default function generateEZTicket(url, username, groups = []) {
    const packet = [
        `$u${Date.now()}`,
        `$g${groups.join('+')}`,
        `$e`
    ].join('');

    const hash = sha512(`${EZproxy.secret}${username}${packet}`, EZproxy.secret);
    const EZproxyTicket = `${hash}${packet}`;

    return `${EZproxy.url}/login?user=${encodeURIComponent(username)}&ticket=${EZproxyTicket}&url=${url}`;
}
