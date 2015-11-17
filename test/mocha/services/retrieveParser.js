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
        assert.deepEqual(retrieveParser(data), [
            {name: 'a', value: 'data for a'},
            {name: 'b', value: 'data for b'},
            {name: 'c', value: 'data for c'},
            {name: 'db', value: 'database name'}
        ]);
    });

    it ('should default db to undefined', function () {
        assert.deepEqual(retrieveParser({}), [{
            name: 'db', value: undefined
        }]);
    });

});
