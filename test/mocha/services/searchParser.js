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
                },
                SearchCriteria: {
                    FacetFilters: []
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
            ],
            activeFacets: []
        });
    });

    it ('should set active facets', function () {
        const searchData = {
            SearchRequest: {
                RetrievalCriteria: {
                    PageNumber: 2
                },
                SearchCriteria: {
                    FacetFilters: [
                        {
                            FilterId: 2,
                            FacetValuesWithAction: [
                                {
                                    FacetValue: {
                                        Id: 'Language',
                                        Value: 'french'
                                    },
                                    RemoveAction: 'removefacetfiltervalue(2,Language:french)'
                                }
                            ],
                            RemoveAction: 'removefacetfilter(2)'
                        },
                        {
                            FilterId: 3,
                            FacetValuesWithAction: [
                                {
                                    FacetValue: {
                                        Id: 'SourceType',
                                        Value: 'Non-Print Resources'
                                    },
                                    RemoveAction: 'removefacetfiltervalue(3,SourceType:Non-Print Resources)'
                                }
                            ],
                            RemoveAction: 'removefacetfilter(3)'
                        }
                    ]
                }
            },
            SearchResult: {
                Statistics: {
                    TotalHits: 50
                },
                Data: {
                    Records: []
                },
                AvailableFacets: []
            }
        };
        assert.deepEqual(searchParser(searchData), {
            currentPage: 2,
            maxPage: 3,
            totalHits: 50,
            results: [],
            facets: [],
            activeFacets: searchData.SearchRequest.SearchCriteria.FacetFilters
        });
    });

});
