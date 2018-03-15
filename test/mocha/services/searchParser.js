import searchParser from '../../../lib/services/searchParser';
import { parse as parseActiveFacets } from '../../../lib/services/activeFacetParser';
import parseDateRange from '../../../lib/services/parseDateRange';

describe('searchParser', function() {
    let customSearchParser;
    let parserCalls = [];
    before(function() {
        customSearchParser = searchParser(record => {
            parserCalls.push(record);
            return 'parsed Record';
        });
    });

    it('should return simple empty response if SearchResult.Statistics.TotalHits is 0', function() {
        assert.deepEqual(
            customSearchParser({
                SearchRequest: {
                    RetrievalCriteria: {
                        PageNumber: 1,
                        ResultsPerPage: 20,
                    },
                    SearchCriteria: {
                        FacetFilters: [],
                    },
                },
                SearchResult: {
                    Statistics: {
                        TotalHits: 0,
                    },
                    Data: {
                        Records: [],
                    },
                    AvailableFacets: [],
                },
            }),
            {
                results: [],
                totalHits: 0,
                currentPage: 1,
                maxPage: 1,
                facets: [],
                activeFacets: {},
                dateRange: parseDateRange(),
            },
        );
    });

    it('should set pagination', function() {
        assert.deepEqual(
            customSearchParser({
                SearchRequest: {
                    RetrievalCriteria: {
                        PageNumber: 2,
                        ResultsPerPage: 20,
                    },
                    SearchCriteria: {
                        FacetFilters: [],
                    },
                },
                SearchResult: {
                    Statistics: {
                        TotalHits: 50,
                    },
                    Data: {
                        Records: [],
                    },
                    AvailableFacets: [
                        {
                            Id: 'facetId',
                            Label: 'facetLabel',
                            AvailableFacetValues: [],
                        },
                    ],
                },
                noFullText: true,
            }),
            {
                currentPage: 2,
                maxPage: 3,
                totalHits: 50,
                results: [],
                facets: [
                    {
                        Id: 'facetId',
                        Label: 'facetLabel',
                        AvailableFacetValues: [],
                    },
                ],
                activeFacets: {},
                dateRange: parseDateRange(),
                noFullText: true,
            },
        );
    });

    it('should set active facets', function() {
        const searchData = {
            SearchRequest: {
                RetrievalCriteria: {
                    PageNumber: 2,
                    ResultsPerPage: 20,
                },
                SearchCriteria: {
                    FacetFilters: [
                        {
                            FilterId: 2,
                            FacetValues: [
                                {
                                    Id: 'Language',
                                    Value: 'french',
                                },
                            ],
                        },
                        {
                            FilterId: 3,
                            FacetValues: [
                                {
                                    Id: 'SourceType',
                                    Value: 'Non-Print Resources',
                                },
                            ],
                        },
                    ],
                },
            },
            SearchResult: {
                Statistics: {
                    TotalHits: 50,
                },
                Data: {
                    Records: [],
                },
                AvailableFacets: [],
            },
        };
        assert.deepEqual(customSearchParser(searchData), {
            currentPage: 2,
            maxPage: 3,
            totalHits: 50,
            results: [],
            facets: [],
            activeFacets: parseActiveFacets(
                searchData.SearchRequest.SearchCriteria.FacetFilters,
            ),
            dateRange: parseDateRange(),
            noFullText: undefined,
        });
    });

    it('should call given parser with searchData.SearchResult.Data.Records, and pass result to results', function() {
        const searchData = {
            SearchRequest: {
                RetrievalCriteria: {
                    PageNumber: 2,
                    ResultsPerPage: 20,
                },
                SearchCriteria: {
                    FacetFilters: [],
                },
            },
            SearchResult: {
                Statistics: {
                    TotalHits: 50,
                },
                Data: {
                    Records: [1, 2, 3],
                },
                AvailableFacets: [],
            },
        };

        assert.deepEqual(customSearchParser(searchData), {
            currentPage: 2,
            maxPage: 3,
            totalHits: 50,
            results: ['parsed Record', 'parsed Record', 'parsed Record'],
            facets: [],
            activeFacets: {},
            dateRange: parseDateRange(),
            noFullText: undefined,
        });
        assert.deepEqual(parserCalls, searchData.SearchResult.Data.Records);
    });
});
