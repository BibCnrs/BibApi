import retrieveArticleParser from '../../../lib/services/retrieveArticleParser';
import { Record as data } from './retrieveArticleParser.json';
import parsedData from './parsedRetrieveArticleParser.json';

describe('retrieveArticleParser', function () {

    it('should extract DbId from ebsco record', function* () {
        const data = {
            Header: {
                DbId: 'databaseId',
                DbLabel: 'database name'
            }
        };
        assert.deepEqual(yield retrieveArticleParser(data), [
            {name: 'db', label: 'database name', value: 'databaseId'}
        ]);
    });

    it ('should default db to undefined', function* () {
        assert.deepEqual(yield retrieveArticleParser({}), [{
            name: 'db', label: undefined, value: undefined
        }]);
    });

    it('should parse raw result', function* () {
        assert.deepEqual(yield retrieveArticleParser(data), parsedData);
    });

});
