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
        assert.deepEqual(yield retrieveArticleParser(data), {
            dbId: 'databaseId',
            dbLabel: 'database name',
            articleLinks: {
                fullTextLinks: [],
                pdfLinks: []
            },
            items: []
        });
    });

    it ('should default db to undefined', function* () {
        assert.deepEqual(yield retrieveArticleParser({}), {
            dbId: undefined,
            dbLabel: undefined,
            articleLinks: {
                fullTextLinks: [],
                pdfLinks: []
            },
            items: []
        });
    });

    it('should parse raw result', function* () {
        assert.deepEqual(yield retrieveArticleParser(data), parsedData);
    });

});
