'use strict';

import searchParser from '../../../lib/services/searchParser';
import aidsResult from '../../mock/controller/aidsResult.json';

describe('searchParser', function () {

    it('should extract relevant information from ebsco raw result', function () {
        assert.deepEqual(JSON.parse(JSON.stringify(searchParser(aidsResult))), require('./parsedAidsResult.json'));
    });

    it ('should set pagination', function () {
        assert.deepEqual(searchParser({
            SearchRequest: {
                RetrievalCriteria: {
                    PageNumber: 2
                }
            },
            SearchResult: {
                Statistics: {
                    TotalHits: 50
                },
                Data: {
                    Records: []
                },
                AvailableFacets: [
                    { Id: 'facetId', Label: 'facetLabel', AvailableFacetValues: [] }
                ]
            }
        }), {
            currentPage: 2,
            maxPage: 3,
            totalHits: 50,
            results: [],
            facets: [
                { Id: 'facetId', Label: 'facetLabel', AvailableFacetValues: [] }
            ]
        });
    });

});
