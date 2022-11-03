import {
    parsePublicationQueries,
    addTruncatureToQuery,
    addTruncature,
    parseMetadoreSearch,
} from '../../../lib/services/parseSearchQuery';

describe('parseSearchQuery', () => {
    describe('parsePublicationQueries', () => {
        it('should return decoded query', () => {
            assert.deepEqual(
                parsePublicationQueries(
                    '[{ "boolean": "AND", "term": "search term", "field": null }, { "boolean": "AND", "term": "Isaac Newton", "field": "AU" }]',
                ),
                {
                    queries: [
                        {
                            boolean: 'AND',
                            term: 'search term',
                            field: null,
                        },
                        {
                            boolean: 'AND',
                            term: 'Isaac Newton',
                            field: 'AU',
                        },
                    ],
                },
            );
        });

        it('change change query if it match A-Z A2z search', () => {
            assert.deepEqual(
                parsePublicationQueries(
                    '[{ "boolean": "AND", "term": "AL*", "field": "TI" }]',
                ),
                {
                    queries: [
                        {
                            boolean: 'AND',
                            term: 'JN (AL*) OR (TI (AL*) AND (PT book OR PT ebook))',
                            field: null,
                        },
                    ],
                    sort: 'title',
                },
            );
        });

        it('change change query if it match 0-9 A2z search', () => {
            assert.deepEqual(
                parsePublicationQueries(
                    '[{ "boolean": "AND", "term": "0* OR 1* OR 2* OR 3* OR 4* OR 5* OR 6* OR 7* OR 8* OR 9*", "field": "TI" }]',
                ),
                {
                    queries: [
                        {
                            boolean: 'AND',
                            term: 'JN (0* OR 1* OR 2* OR 3* OR 4* OR 5* OR 6* OR 7* OR 8* OR 9*) OR (TI (0* OR 1* OR 2* OR 3* OR 4* OR 5* OR 6* OR 7* OR 8* OR 9*) AND (PT book OR PT ebook))',
                            field: null,
                        },
                    ],
                    sort: 'title',
                },
            );
        });
    });

    describe('addTruncatureToQuery', () => {
        it('should add truncature to term if field is TI', () => {
            assert.deepEqual(
                addTruncatureToQuery({
                    boolean: 'AND',
                    term: 'Method of Fluxions',
                    field: 'TI',
                }),
                {
                    boolean: 'AND',
                    term: 'Method* of* Fluxions*',
                    field: 'TI',
                },
            );
        });

        it('should not add truncature if field is not TI', () => {
            assert.deepEqual(
                addTruncatureToQuery({
                    boolean: 'AND',
                    term: 'newton',
                    field: 'AU',
                }),
                {
                    boolean: 'AND',
                    term: 'newton',
                    field: 'AU',
                },
            );
        });

        it('should not add truncature if already present', () => {
            assert.deepEqual(
                addTruncatureToQuery({
                    boolean: 'AND',
                    term: 'Method of Fluxions*',
                    field: 'TI',
                }),
                {
                    boolean: 'AND',
                    term: 'Method* of* Fluxions*',
                    field: 'TI',
                },
            );
        });
    });

    describe('addTruncature', () => {
        it('should add truncature after each word', () => {
            assert.equal(
                addTruncature('Method of Fluxions'),
                'Method* of* Fluxions*',
            );
        });

        it('should not add truncature after word that have one', () => {
            assert.equal(
                addTruncature('Method of* Fluxions'),
                'Method* of* Fluxions*',
            );
        });

        it('should not add truncature to non word (number, punctuation)', () => {
            const term =
                'The 2nd International Symposium of BRAIN TUMOR PATHOLOGY and the 18th Annual Meeting of the Japan Society of Brain Tumor Pathology May 11–13, 2000 Nagoya Trade and Industry Center Nagoya, Japan';

            assert.equal(
                addTruncature(term),
                'The* 2nd International* Symposium* of* BRAIN* TUMOR* PATHOLOGY* and* the* 18th Annual* Meeting* of* the* Japan* Society* of* Brain* Tumor* Pathology* May* 11–13, 2000 Nagoya* Trade* and* Industry* Center* Nagoya, Japan*',
            );
        });
    });
    describe('parseMetadoreSearch', () => {
        it('should return expected query string when no currentPage is sent', () => {
            const rawQuery = {
                queries: '[{"term":"search term","suggestedTerms":[]}]',
                resultsPerPage: '10',
            };
            const expectedQueryString = 'query=search+term&size=10';
            assert.equal(
                parseMetadoreSearch(rawQuery).toString(),
                expectedQueryString,
            );
        });
        it('should return expected query string when a currentPage is sent', () => {
            const rawQuery = {
                queries: '[{"term":"search term","suggestedTerms":[]}]',
                resultsPerPage: '10',
                currentPage: '3',
            };
            // page = 30 because of metadore API pagination
            const expectedQueryString = 'query=search+term&size=10&page=20';
            assert.equal(
                parseMetadoreSearch(rawQuery).toString(),
                expectedQueryString,
            );
        });
        it('should return expected query string when a field is set', () => {
            const rawQuery = {
                queries:
                    '[{"term":"search term","suggestedTerms":[],"field":"attributes.descriptions.description"}]',
                resultsPerPage: '10',
            };
            const expectedQueryString =
                'query=%28attributes.descriptions.description%3A%22search+term%22%29&size=10';
            assert.equal(
                parseMetadoreSearch(rawQuery).toString(),
                expectedQueryString,
            );
        });
        it('should return expected query string when the field is title and term contains one word', () => {
            const rawQuery = {
                queries:
                    '[{"term":"covid","suggestedTerms":[],"field":"attributes.titles.title"}]',
                resultsPerPage: '10',
            };
            const expectedQueryString =
                'query=%28attributes.titles.title%3A*covid*%29&size=10';
            assert.equal(
                parseMetadoreSearch(rawQuery).toString(),
                expectedQueryString,
            );
        });
        it('should return expected query string when the field is title and term contains a group of words', () => {
            const rawQuery = {
                queries:
                    '[{"term":"covid pandemic","suggestedTerms":[],"field":"attributes.titles.title"}]',
                resultsPerPage: '10',
            };
            const expectedQueryString =
                'query=%28attributes.titles.title%3A*covid*%29AND%28attributes.titles.title%3A*pandemic*%29&size=10';
            assert.equal(
                parseMetadoreSearch(rawQuery).toString(),
                expectedQueryString,
            );
        });
    });
});
