import { searchArticleFactory } from '../../../lib/services/searchArticle';

describe('searchArticle', () => {
    let searchArticle;
    before(() => {
        searchArticle = searchArticleFactory({
            search: (...args) => ({
                name: 'search',
                args,
            }),
            parse: (...args) => ({
                name: 'parse',
                args,
            }),
            getRetryQuery: (...args) => ({
                name: 'getRetryQuery',
                args,
            }),
        });
    });

    it('should execute the query, parse it, then return it', () => {
        const it = searchArticle(
            'INSB',
            {
                user_id: 'user_id',
                password: 'password',
                profile: 'profile',
            },
            'query',
            {
                get: (...args) => ({
                    name: 'ebscoSession.get',
                    args,
                }),
                invalidateSession: (...args) => ({
                    name: 'ebscoSession.invalidateSession',
                    args,
                }),
            },
        );

        assert.deepEqual(it.next(), {
            done: false,
            value: {
                name: 'ebscoSession.get',
                args: ['INSB', 'user_id', 'password', 'profile'],
            },
        });

        assert.deepEqual(
            it.next({
                authToken: 'authToken',
                sessionToken: 'sessionToken',
            }),
            {
                done: false,
                value: {
                    name: 'search',
                    args: ['query', 'sessionToken', 'authToken'],
                },
            },
        );

        assert.deepEqual(
            it.next({
                SearchResult: {
                    Statistics: {
                        TotalHits: '42',
                    },
                },
            }),
            {
                done: false,
                value: {
                    name: 'parse',
                    args: [
                        {
                            SearchResult: {
                                Statistics: {
                                    TotalHits: '42',
                                },
                            },
                        },
                    ],
                },
            },
        );

        assert.deepEqual(it.next('parsed result'), {
            done: true,
            value: 'parsed result',
        });
    });

    it('should retry the query with title from crossref if it contains a DOI and has no result', () => {
        const it = searchArticle(
            'INSB',
            {
                user_id: 'user_id',
                password: 'password',
                profile: 'profile',
            },
            'query',
            {
                get: (...args) => ({
                    name: 'ebscoSession.get',
                    args,
                }),
                invalidateSession: (...args) => ({
                    name: 'ebscoSession.invalidateSession',
                    args,
                }),
            },
        );

        it.next();

        it.next({
            authToken: 'authToken',
            sessionToken: 'sessionToken',
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
                    name: 'getRetryQuery',
                    args: ['query'],
                },
            },
        );

        assert.deepEqual(it.next('retryQuery'), {
            done: false,
            value: {
                name: 'search',
                args: ['retryQuery', 'sessionToken', 'authToken'],
            },
        });

        assert.deepEqual(it.next('retryResult'), {
            done: false,
            value: {
                name: 'parse',
                args: ['retryResult'],
            },
        });

        assert.deepEqual(it.next('parsed result'), {
            done: true,
            value: 'parsed result',
        });
    });

    it('should not retry the query with title from crossref if it contains no DOI and has no result', () => {
        const it = searchArticle(
            'INSB',
            {
                user_id: 'user_id',
                password: 'password',
                profile: 'profile',
            },
            'query',
            {
                get: (...args) => ({
                    name: 'ebscoSession.get',
                    args,
                }),
                invalidateSession: (...args) => ({
                    name: 'ebscoSession.invalidateSession',
                    args,
                }),
            },
        );

        it.next();

        it.next({
            authToken: 'authToken',
            sessionToken: 'sessionToken',
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
                    name: 'getRetryQuery',
                    args: ['query'],
                },
            },
        );

        // no doi so no retry query
        assert.deepEqual(it.next(null), {
            done: false,
            value: {
                name: 'parse',
                args: [
                    {
                        SearchResult: {
                            Statistics: {
                                TotalHits: 0,
                            },
                        },
                    },
                ],
            },
        });

        assert.deepEqual(it.next('parsed result'), {
            done: true,
            value: 'parsed result',
        });
    });

    it('should invalidateSession if search trigger an error', () => {
        const it = searchArticle(
            'INSB',
            {
                user_id: 'user_id',
                password: 'password',
                profile: 'profile',
            },
            'query',
            {
                get: (...args) => ({
                    name: 'ebscoSession.get',
                    args,
                }),
                invalidateSession: (...args) => ({
                    name: 'ebscoSession.invalidateSession',
                    args,
                }),
            },
        );

        it.next();

        it.next({
            authToken: 'authToken',
            sessionToken: 'sessionToken',
        });

        const searchError = new Error('search error');
        assert.deepEqual(it.throw(searchError), {
            done: false,
            value: {
                name: 'ebscoSession.invalidateSession',
                args: ['INSB'],
            },
        });

        assert.throws(() => it.next(), searchError);
    });
});
