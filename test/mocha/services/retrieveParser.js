'use strict';

import retrieveParser from '../../../lib/services/retrieveParser';

describe('retrieveParser', function () {

    it('should extract notice data from ebsco record', function () {
        const data = {
            Header: {
                DbLabel: 'database name'
            },
            Items: [
                { Name: 'a', Data: 'data for a' },
                { Name: 'b', Data: 'data for b' },
                { Name: 'c', Data: 'data for c' },
                { SurName: 'd', Data: 'data for d' },
                { Name: 'e', Datum: 'data for e' }
            ]
        };
        assert.deepEqual(retrieveParser(data), {
            a: 'data for a',
            b: 'data for b',
            c: 'data for c',
            db: 'database name'
        });
    });

    it ('should default db to undefined', function () {
        assert.deepEqual(retrieveParser({}), {
            db: undefined
        });
    });

});
