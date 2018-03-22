import { searchArticleFactory } from '../../../lib/services/searchArticle';

describe('searchArticle', () => {
    let searchArticle;
    before(() => {
        searchArticle = searchArticleFactory({
            search: (...args) => ({
                name: 'search',
                args,
            }),
            getRetryQuery: (...args) => ({
                name: 'getRetryQuery',
                args,
            }),
        })('sessionToken', 'authToken');
    });

    it('should execute the query, then return the result', () => {
        const it = searchArticle('query');
        assert.deepEqual(it.next(), {
            value: {
                name: 'search',
                args: ['query', 'sessionToken', 'authToken', undefined],
            },
            done: false,
        });

        assert.deepEqual(
            it.next({
                SearchResult: {
                    Statistics: {
                        TotalHits: '42',
                    },
                },
            }),
            {
                done: true,
                value: {
                    SearchResult: {
                        Statistics: {
                            TotalHits: '42',
                        },
                    },
                },
            },
        );
    });

    it('should retry the query with title from crossref if it contains a DOI and has no result', () => {
        const it = searchArticle('query');

        it.next();

        assert.deepEqual(
            it.next({
                SearchResult: {
                    Statistics: {
                        TotalHits: 0,
                    },
                },
            }),
            {
                done: false,
                value: {
                    name: 'getRetryQuery',
                    args: ['query'],
                },
            },
        );

        assert.deepEqual(it.next('retryQuery'), {
            done: false,
            value: {
                name: 'search',
                args: ['retryQuery', 'sessionToken', 'authToken', undefined],
            },
        });

        assert.deepEqual(
            it.next({
                SearchResult: {
                    Statistics: {
                        TotalHits: 100,
                    },
                },
            }),
            {
                done: true,
                value: {
                    SearchResult: {
                        Statistics: {
                            TotalHits: 100,
                        },
                    },
                    doiRetry: true,
                },
            },
        );
    });

    it('should retry the query without filter if doi crossref has no result', () => {
        const it = searchArticle('query');

        it.next();

        assert.deepEqual(
            it.next({
                SearchResult: {
                    Statistics: {
                        TotalHits: 0,
                    },
                },
            }),
            {
                done: false,
                value: {
                    name: 'getRetryQuery',
                    args: ['query'],
                },
            },
        );

        assert.deepEqual(it.next({ retryQuery: true, FT: 'Y' }), {
            done: false,
            value: {
                name: 'search',
                args: [
                    { retryQuery: true, FT: 'Y' },
                    'sessionToken',
                    'authToken',
                    undefined,
                ],
            },
        });

        assert.deepEqual(
            it.next({
                SearchResult: {
                    Statistics: {
                        TotalHits: 0,
                    },
                },
            }),
            {
                done: false,
                value: {
                    name: 'search',
                    args: [
                        { retryQuery: true },
                        'sessionToken',
                        'authToken',
                        undefined,
                    ],
                },
            },
        );

        assert.deepEqual(
            it.next({
                noFulltextResult: true,
                noFullText: true,
            }),
            {
                done: true,
                value: {
                    noFulltextResult: true,
                    noFullText: true,
                },
            },
        );
    });

    it('should not retry the query with title from crossref if it contains no DOI and has no result', () => {
        const it = searchArticle('query');

        it.next();

        assert.deepEqual(
            it.next({
                SearchResult: {
                    Statistics: {
                        TotalHits: 0,
                    },
                },
            }),
            {
                done: false,
                value: {
                    name: 'getRetryQuery',
                    args: ['query'],
                },
            },
        );

        // no doi so no retry query returning result
        assert.deepEqual(it.next(null), {
            done: true,
            value: {
                SearchResult: {
                    Statistics: {
                        TotalHits: 0,
                    },
                },
            },
        });
    });
});
