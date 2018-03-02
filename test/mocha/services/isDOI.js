import isDOI from '../../../lib/services/isDOI';

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
