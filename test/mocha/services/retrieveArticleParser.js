import retrieveArticleParser from '../../../lib/services/retrieveArticleParser';

describe('retrieveArticleParser', function () {

    it('should extract DbId from ebsco record', function () {
        const data = {
            Header: {
                DbId: 'databaseId',
                DbLabel: 'database name'
            }
        };
        assert.deepEqual(retrieveArticleParser(data), [
            {name: 'db', label: 'database name', value: 'databaseId'}
        ]);
    });

    it ('should default db to undefined', function () {
        assert.deepEqual(retrieveArticleParser({}), [{
            name: 'db', label: undefined, value: undefined
        }]);
    });

});
