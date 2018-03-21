import getMissingResults from '../../../lib/services/getMissingResults';

const getEbscoResultFromIdentifiers = identifiers => ({
    SearchResult: {
        Data: {
            Records: identifiers.map(({ DbId, An }) => ({
                Header: {
                    DbId,
                    An,
                },
            })),
        },
    },
});

describe('getMissingResults', () => {
    it('should return result1 not in result2', () => {
        const result1 = getEbscoResultFromIdentifiers([
            { DbId: 1, An: 1 },
            { DbId: 'original', An: 'original' },
            { DbId: 2, An: 2 },
            { DbId: 3, An: 3 },
        ]);
        const result2 = getEbscoResultFromIdentifiers([
            { DbId: 1, An: 1 },
            { DbId: 2, An: 2 },
            { DbId: 3, An: 3 },
        ]);
        assert.deepEqual(getMissingResults(result1, result2), [
            { Header: { DbId: 'original', An: 'original' } },
        ]);
    });

    it('should return empty array if all result1 present in result2', () => {
        const result1 = getEbscoResultFromIdentifiers([
            { DbId: 1, An: 1 },
            { DbId: 2, An: 2 },
            { DbId: 3, An: 3 },
        ]);
        const result2 = getEbscoResultFromIdentifiers([
            { DbId: 1, An: 1 },
            { DbId: 2, An: 2 },
            { DbId: 3, An: 3 },
        ]);
        assert.deepEqual(getMissingResults(result1, result2), []);
    });

    it('should ignore result present in result2 but not in result1', () => {
        const result1 = getEbscoResultFromIdentifiers([
            { DbId: 1, An: 1 },
            { DbId: 2, An: 2 },
            { DbId: 3, An: 3 },
        ]);
        const result2 = getEbscoResultFromIdentifiers([
            { DbId: 1, An: 1 },
            { DbId: 2, An: 2 },
            { DbId: 'original', An: 'original' },
            { DbId: 3, An: 3 },
        ]);
        assert.deepEqual(getMissingResults(result1, result2), []);
    });

    it('should return empty array if result1 is empty', () => {
        const result1 = getEbscoResultFromIdentifiers([]);
        const result2 = getEbscoResultFromIdentifiers([
            { DbId: 1, An: 1 },
            { DbId: 2, An: 2 },
            { DbId: 3, An: 3 },
        ]);
        assert.deepEqual(getMissingResults(result1, result2), []);
    });
});
