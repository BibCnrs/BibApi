import { parseQueries } from '../../../lib/services/parsePublicationSearchQuery';

describe('parsePublicationSearchQuery', () => {
    describe('parseQueries', () => {
        it('should return decoded query', () => {
            assert.deepEqual(
                parseQueries(
                    '[{ "boolean": "AND", "term": "search term", "field": null }, { "boolean": "AND", "term": "Isaac Newton", "field": "AU" }]'
                ),
                [
                    { boolean: 'AND', term: 'search term', field: null },
                    { boolean: 'AND', term: 'Isaac Newton', field: 'AU' },
                ]
            );
        });

        it('change change query if it match A-Z A2z search', () => {
            assert.deepEqual(
                parseQueries(
                    '[{ "boolean": "AND", "term": "AL*", "field": "TI" }]'
                ),
                [
                    {
                        boolean: 'AND',
                        term: 'JN AL* OR (TI (AL) AND (PT book OR PT ebook))',
                        field: null
                    },
                ]
            );
        });

        it('change change query if it match 0-9 A2z search', () => {
            assert.deepEqual(
                parseQueries(
                    '[{ "boolean": "AND", "term": "0* OR 1* OR 2* OR 3* OR 4* OR 5* OR 6* OR 7* OR 8* OR 9*", "field": "TI" }]'
                ),
                [
                    {
                        boolean: 'AND',
                        term: 'JN (0* OR 1* OR 2* OR 3* OR 4* OR 5* OR 6* OR 7* OR 8* OR 9*) OR (TI (0* OR 1* OR 2* OR 3* OR 4* OR 5* OR 6* OR 7* OR 8* OR 9*) AND (PT book OR PT ebook))',
                        field: null
                    },
                ]
            );
        });
    });
});
