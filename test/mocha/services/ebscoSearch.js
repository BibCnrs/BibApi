import ebscoSearch, { getEbscoQuery } from '../../../lib/services/ebscoSearch';
import mockSearch from '../../mock/controller/search';
import aidsResult from '../../mock/controller/aidsResult.json';

describe('ebscoSearch', function () {

    describe('getEbscoQuery', function () {
        it('should set queeries in SearchCriteria.Queries', function () {
            assert.deepEqual(getEbscoQuery({queries: [{ operator: 'AND', field: 'TI', term: 'term' }] }), {
                SearchCriteria: {
                    Queries: [
                        { BooleanOperator: 'AND', FieldCode: 'TI', Term: 'term' }
                    ],
                    SearchMode: 'all',
                    IncludeFacets: 'y',
                    FacetFilters: [],
                    Limiters: [],
                    Expanders: [],
                    Sort: 'relevance'
                },
                RetrievalCriteria: {
                    View: 'brief',
                    ResultsPerPage: 20,
                    PageNumber: 1,
                    Highlight: 'n'
                },
                Actions: [
                    'goToPage(1)'
                ]
            });
        });

        it('should set activeFacets in SearchCriteria.FacetFilters decoded in literal', function () {
            assert.deepEqual(getEbscoQuery({ activeFacets: { facet: ['values'] } }), {
                SearchCriteria: {
                    Queries: null,
                    SearchMode: 'all',
                    IncludeFacets: 'y',
                    FacetFilters: [{
                        FilterId: 1,
                        FacetValues: [{
                            Id: 'facet',
                            Value: 'values'
                        }]
                    }],
                    Limiters: [],
                    Expanders: [],
                    Sort: 'relevance'
                },
                RetrievalCriteria: {
                    View: 'brief',
                    ResultsPerPage: 20,
                    PageNumber: 1,
                    Highlight: 'n'
                },
                Actions: [
                    'goToPage(1)'
                ]
            });
        });

        it('should set action in actions array', function () {
            assert.deepEqual(getEbscoQuery({ action: 'doAnAction(now)'}), {
                SearchCriteria: {
                    Queries: null,
                    SearchMode: 'all',
                    IncludeFacets: 'y',
                    FacetFilters: [],
                    Limiters: [],
                    Expanders: [],
                    Sort: 'relevance'
                },
                RetrievalCriteria: {
                    View: 'brief',
                    ResultsPerPage: 20,
                    PageNumber: 1,
                    Highlight: 'n'
                },
                Actions: [
                    'goToPage(1)',
                    'doAnAction(now)'
                ]
            });
        });

        it('should set key that are limiter into SearchCriteria.Limiters', function () {
            assert.deepEqual(getEbscoQuery({ FT: 'y', AU: 'Terry Pratchett' }), {
                SearchCriteria: {
                    Queries: null,
                    SearchMode: 'all',
                    IncludeFacets: 'y',
                    FacetFilters: [],
                    Limiters: [
                        {
                            Id: 'FT',
                            Values: ['y']
                        },
                        {
                            Id: 'AU',
                            Values: ['Terry Pratchett']
                        }
                    ],
                    Expanders: [],
                    Sort: 'relevance'
                },
                RetrievalCriteria: {
                    View: 'brief',
                    ResultsPerPage: 20,
                    PageNumber: 1,
                    Highlight: 'n'
                },
                Actions: [
                    'goToPage(1)'
                ]
            });
        });

        it('should set SearchCriteria.Sort to query.term', function () {
            assert.deepEqual(getEbscoQuery({ sort: 'date' }), {
                SearchCriteria: {
                    Queries: null,
                    SearchMode: 'all',
                    IncludeFacets: 'y',
                    FacetFilters: [],
                    Limiters: [],
                    Expanders: [],
                    Sort: 'date'
                },
                RetrievalCriteria: {
                    View: 'brief',
                    ResultsPerPage: 20,
                    PageNumber: 1,
                    Highlight: 'n'
                },
                Actions: [
                    'goToPage(1)'
                ]
            });
        });
    });

    describe('EDS', function () {
        let ebscoEdsSearch;
        let receivedTerm, receivedLimiters, receivedSessionToken, receivedAuthToken, receivedAction, ReceivedFacetFilters;
        beforeEach(function () {
            ebscoEdsSearch = ebscoSearch('rest');
            apiServer.router.post(`/edsapi/rest/Search`, function* (next) {
                receivedAction = this.request.body.Actions;
                receivedTerm = this.request.body.SearchCriteria.Queries[0].Term;
                receivedLimiters = this.request.body.SearchCriteria.Limiters;
                ReceivedFacetFilters = this.request.body.SearchCriteria.FacetFilters;
                receivedSessionToken = this.request.header['x-sessiontoken'];
                receivedAuthToken = this.request.header['x-authenticationtoken'];
                yield next;
            }, mockSearch);
            apiServer.start();
        });

        it('should send term, token, limiters action and activeFacets', function* () {
            let result = yield ebscoEdsSearch({
                queries: [
                    { term: 'aids' }
                ],
                FT: 'y',
                DT1: '2015-01/2015-11',
                currentPage: 10,
                action: 'action()',
                activeFacets: {
                    facet: ['values']
                }
            }, 'session-token-for-vie', 'authToken');
            assert.equal(receivedTerm, 'aids');
            assert.deepEqual(receivedAction, ['goToPage(10)', 'action()']);
            assert.deepEqual(receivedLimiters, [
                { Id: 'FT', Values: ['y'] },
                { Id: 'DT1', Values: ['2015-01/2015-11'] }
            ]);
            assert.deepEqual(ReceivedFacetFilters, [{
                FilterId: 1,
                FacetValues: [{
                    Id: 'facet',
                    Value: 'values'
                }]
            }]);
            assert.equal(receivedSessionToken, 'session-token-for-vie');
            assert.equal(receivedAuthToken, 'authToken');
            assert.deepEqual(result, aidsResult);
        });

        afterEach(function () {
            apiServer.close();
        });
    });

    describe('publication', function () {
        let ebscoPublicationSearch;
        let receivedTerm, receivedLimiters, receivedSessionToken, receivedAuthToken, receivedAction, ReceivedFacetFilters;
        beforeEach(function () {
            ebscoPublicationSearch = ebscoSearch('publication');
            apiServer.router.post(`/edsapi/publication/Search`, function* (next) {
                receivedAction = this.request.body.Actions;
                receivedTerm = this.request.body.SearchCriteria.Queries[0].Term;
                receivedLimiters = this.request.body.SearchCriteria.Limiters;
                ReceivedFacetFilters = this.request.body.SearchCriteria.FacetFilters;
                receivedSessionToken = this.request.header['x-sessiontoken'];
                receivedAuthToken = this.request.header['x-authenticationtoken'];
                yield next;
            }, mockSearch);
            apiServer.start();
        });

        it('should send term, token, limiters action and activeFacets', function* () {
            let result = yield ebscoPublicationSearch({
                queries: [
                    { term: 'aids' }
                ],
                FT: 'y',
                DT1: '2015-01/2015-11',
                currentPage: 10,
                action: 'action()',
                activeFacets: {
                    facet: ['values']
                }
            }, 'session-token-for-vie', 'authToken');
            assert.equal(receivedTerm, 'aids');
            assert.deepEqual(receivedAction, ['goToPage(10)', 'action()']);
            assert.deepEqual(receivedLimiters, [
                { Id: 'FT', Values: ['y'] },
                { Id: 'DT1', Values: ['2015-01/2015-11'] }
            ]);
            assert.deepEqual(ReceivedFacetFilters, [{
                FilterId: 1,
                FacetValues: [{
                    Id: 'facet',
                    Value: 'values'
                }]
            }]);
            assert.equal(receivedSessionToken, 'session-token-for-vie');
            assert.equal(receivedAuthToken, 'authToken');
            assert.deepEqual(result, aidsResult);
        });

        afterEach(function () {
            apiServer.close();
        });
    });

});
