'use strict';

import retrieveParser from '../../../lib/services/retrieveParser';

describe('retrieveParser', function () {

    it('should extract notice data from ebsco record', function () {
        const data = {
            Header: {
                DbId: 'databaseId',
                DbLabel: 'database name'
            },
            Items: [
                { Name: 'a', Label: 'label a', Data: 'data for a' },
                { Name: 'b', Label: 'label b', Data: 'data for b' },
                { Name: 'c', Label: 'label c', Data: 'data for c' },
                { SurName: 'd', Label: 'label d', Data: 'data for d' },
                { Name: 'e', Label: 'label e', Datum: 'data for e' }
            ]
        };
        assert.deepEqual(retrieveParser(data), [
            {name: 'a', label: 'label a', value: 'data for a'},
            {name: 'b', label: 'label b', value: 'data for b'},
            {name: 'c', label: 'label c', value: 'data for c'},
            {name: 'db', label: 'database name', value: 'databaseId'}
        ]);
    });

    it ('should default db to undefined', function () {
        assert.deepEqual(retrieveParser({}), [{
            name: 'db', label: undefined, value: undefined
        }]);
    });

});
