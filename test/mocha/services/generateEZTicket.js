import generateEZTicket from '../../../lib/services/generateEZTicket';
import sha512 from '../../../lib/utils/sha512';
import { EzProxy } from 'config';

describe('generateEZTicket', function () {
    const timestamp = Math.round(Date.now() / 1000);

    it ('should generate ticket url based on url, username, groups and timestamp', function () {
        assert.equal(
            generateEZTicket('gate.test.com', 'http://google.com', 'john', ['bibliovie', 'biblioshs'], timestamp),
            [
                'http://gate.test.com',
                '/login?user=john&ticket=',
                encodeURIComponent(sha512(`${EzProxy.secret}john$u${timestamp}$gbibliovie+biblioshs$e`, EzProxy.secret)),
                encodeURIComponent(`$u${timestamp}$gbibliovie+biblioshs$e`),
                '&url=http://google.com'
            ].join('')
        );
    });

    it ('should omit groups if none given', function () {
        assert.equal(
            generateEZTicket('gate.test.com', 'http://google.com', 'john', undefined, timestamp),
            [
                'http://gate.test.com',
                '/login?user=john&ticket=',
                encodeURIComponent(sha512(`${EzProxy.secret}john$u${timestamp}$e`, EzProxy.secret)),
                encodeURIComponent(`$u${timestamp}$e`),
                '&url=http://google.com'
            ].join('')
        );
    });
});
