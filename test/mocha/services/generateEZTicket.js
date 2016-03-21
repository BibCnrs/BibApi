import generateEZTicket from '../../../lib/services/generateEZTicket';
import sha512 from '../../../lib/utils/sha512';
import { EzProxy } from 'config';

describe('generateEZTicket', function () {
    it ('should generate ticket url based on url, username, groups and timestamp', function () {
        assert.equal(
            generateEZTicket('http://google.com', 'john', ['bibliovie', 'biblioshs'], 'timestamp'),
            [
                EzProxy.url,
                '/login?user=john&ticket=',
                sha512(`${EzProxy.secret}john$utimestamp$gbibliovie+biblioshs$e`, EzProxy.secret),
                '$utimestamp$gbibliovie+biblioshs$e&url=http://google.com'
            ].join('')
        );
    });

    it ('should omit groups if none given', function () {
        assert.equal(
            generateEZTicket('http://google.com', 'john', undefined, 'timestamp'),
            [
                EzProxy.url,
                '/login?user=john&ticket=',
                sha512(`${EzProxy.secret}john$utimestamp$e`, EzProxy.secret),
                '$utimestamp$e&url=http://google.com'
            ].join('')
        );
    });
});
