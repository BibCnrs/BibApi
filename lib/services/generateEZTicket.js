import { EzProxy } from 'config';

import sha512 from '../utils/sha512';

export default function generateEZTicket(
    gate,
    url,
    username,
    groups = [],
    timestamp = Math.floor(Date.now() / 1000),
) {
    const packet = [
        `$u${timestamp}`,
        groups.length ? `$g${groups.join('+')}` : '',
        '$e',
    ].join('');

    const hash = sha512(`${EzProxy.ticketSecret}${username}${packet}`);
    const EzProxyTicket = encodeURIComponent(`${hash}${packet}`);

    return `http://${gate}/login?user=${encodeURIComponent(
        username,
    )}&ticket=${EzProxyTicket}&url=${encodeURIComponent(url)}`;
}
