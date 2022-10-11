import parseDateRange from '../../../lib/services/parseDateRange';

describe('parseDateRange', function () {
    it('should return default date range of 1000 to current year +1 when called with no parameter', function () {
        assert.deepEqual(parseDateRange(), {
            min: 1000,
            max: new Date().getFullYear() + 1,
        });
    });

    it('should extract date range in year from AvailableCriteria.DateRange', function () {
        assert.deepEqual(
            parseDateRange({
                AvailableCriteria: {
                    DateRange: {
                        MinDate: '1515-01',
                        MaxDate: '1945-12',
                    },
                },
            }),
            {
                min: 1515,
                max: 1945,
            },
        );
    });
});
