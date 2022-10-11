import getDOIFromQuery, { isDOI } from '../../../lib/services/getDOIFromQuery';

describe('getDOIFromQuery', () => {
    it('should extract DOI from query', () => {
        assert.equal(
            getDOIFromQuery({
                queries: [
                    {
                        term: '10.1088/1748-0221/13/01/C01029',
                        field: null,
                    },
                ],
            }),
            '10.1088/1748-0221/13/01/C01029',
        );
    });

    it('should return null if no DOI', () => {
        assert.equal(
            getDOIFromQuery({
                queries: [{ term: 'not a DOI', field: null }],
            }),
            null,
        );
    });

    it('should return null if complex query', () => {
        assert.equal(
            getDOIFromQuery({
                queries: [
                    {
                        term: '10.1088/1748-0221/13/01/C01029',
                        field: null,
                    },
                    { term: 'Isaac Newton', field: 'AU' },
                ],
            }),
            null,
        );
    });

    it('should return null if field is not null', () => {
        assert.equal(
            getDOIFromQuery({
                queries: [
                    {
                        term: '10.1088/1748-0221/13/01/C01029',
                        field: 'TI',
                    },
                    null,
                ],
            }),
            null,
        );
    });

    describe('isDOI', () => {
        it('should return true if string is a valid doi', () => {
            assert.equal(
                isDOI('10.1016.12.31/nature.S0735-1097(98)2000/12/31/34:7-7'),
                true,
            );
            assert.equal(isDOI('10.1088/1748-0221/13/01/C01029'), true);
        });

        it('should return false if string is not a valid doi', () => {
            assert.equal(isDOI('not a DOI'), false);
        });

        it('should return false if given no string', () => {
            assert.equal(isDOI(), false);
        });
    });
});
