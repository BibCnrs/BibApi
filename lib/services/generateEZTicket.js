import { EzProxy } from 'config';
import sha512 from '../utils/sha512';

export default function generateEZTicket(url, username, groups = [], timestamp = Date.now()) {
    const packet = [
        `$u${timestamp}`,
        groups.length ? `$g${groups.join('+')}` : '',
        `$e`
    ].join('');

    const hash = sha512(`${EzProxy.secret}${username}${packet}`, EzProxy.secret);
    const EzProxyTicket = `${hash}${packet}`;

    return `${EzProxy.url}/login?user=${encodeURIComponent(username)}&ticket=${EzProxyTicket}&url=${url}`;
}
