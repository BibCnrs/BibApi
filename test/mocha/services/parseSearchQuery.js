import {
    parsePublicationQueries,
    addTruncatureToQuery,
    addTruncature,
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
                        { boolean: 'AND', term: 'search term', field: null },
                        { boolean: 'AND', term: 'Isaac Newton', field: 'AU' },
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
                            term:
                                'JN (AL*) OR (TI (AL*) AND (PT book OR PT ebook))',
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
                            term:
                                'JN (0* OR 1* OR 2* OR 3* OR 4* OR 5* OR 6* OR 7* OR 8* OR 9*) OR (TI (0* OR 1* OR 2* OR 3* OR 4* OR 5* OR 6* OR 7* OR 8* OR 9*) AND (PT book OR PT ebook))',
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
    });
});
