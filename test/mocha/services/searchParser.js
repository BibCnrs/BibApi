import searchParser from '../../../lib/services/searchParser';

describe('customSearchParser', function () {
    let customSearchParser;
    let parserCalls = [];
    before(function () {
        customSearchParser = searchParser((record) => {
            parserCalls.push(record);
            return 'parsed Record';
        });
    });

    it ('should return simple empty response if SearchResult.Statistics.TotalHits is 0', function () {
        assert.deepEqual(customSearchParser({
            SearchRequest: {
                RetrievalCriteria: {
                    PageNumber: 1
                },
                SearchCriteria: {
                    FacetFilters: []
                }
            },
            SearchResult: {
                Statistics: {
                    TotalHits: 0
                },
                Data: {
                    Records: []
                },
                AvailableFacets: []
            }
        }), {
            results: [],
            totalHits: 0,
            currentPage: 1,
            maxPage: 1,
            facets: [],
            activeFacets: []
        });
    });

    it ('should set pagination', function () {
        assert.deepEqual(customSearchParser({
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
        assert.deepEqual(customSearchParser(searchData), {
            currentPage: 2,
            maxPage: 3,
            totalHits: 50,
            results: [],
            facets: [],
            activeFacets: searchData.SearchRequest.SearchCriteria.FacetFilters
        });
    });

    it ('should call given parser with searchData.SearchResult.Data.Records, and pass result to results', function () {
        const searchData = {
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
                    Records: [ 1, 2, 3 ]
                },
                AvailableFacets: []
            }
        };

        assert.deepEqual(customSearchParser(searchData), {
            currentPage: 2,
            maxPage: 3,
            totalHits: 50,
            results: [ 'parsed Record', 'parsed Record', 'parsed Record' ],
            facets: [],
            activeFacets: searchData.SearchRequest.SearchCriteria.FacetFilters}
        );
        assert.deepEqual(parserCalls, searchData.SearchResult.Data.Records);
    });

});
