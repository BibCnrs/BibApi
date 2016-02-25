import searchArticleParser from '../../../lib/services/searchArticleParser';
import aidsResult from '../../mock/controller/aidsResult.json';

describe('searchArticleParser', function () {
    it('should extract relevant information from ebsco raw result', function () {
        assert.deepEqual(JSON.parse(JSON.stringify(searchArticleParser(aidsResult))), require('./parsedAidsResult.json'));
    });
});
