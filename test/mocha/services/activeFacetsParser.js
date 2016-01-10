import { parseFacetValue, parseFacetFilter } from '../../../lib/services/activeFacetsParser';

describe('activeFacetsParser', function () {

    describe('parseFacetValue', function () {
        it('should parse facet value', function () {
            assert.deepEqual(parseFacetValue({
                FacetValue: {
                    Id: 'Language',
                    Value: 'french'
                },
                RemoveAction: 'removefacetfiltervalue(2,Language:french)'
            }), {
                value: 'french',
                action: 'removefacetfiltervalue(2,Language:french)'
            });
        });
    });

    describe('parseFacetFilter', function () {

        it('should parse facet filter', function () {
            assert.deepEqual(parseFacetFilter({
                FilterId: 2,
                FacetValuesWithAction: [
                    {
                        FacetValue: {
                            Id: 'Language',
                            Value: 'french'
                        },
                        RemoveAction: 'removefacetfiltervalue(2,Language:french)'
                    }, {
                        FacetValue: {
                            Id: 'Language',
                            Value: 'english'
                        },
                        RemoveAction: 'removefacetfiltervalue(2,Language:english)'
                    }
                ],
                RemoveAction: 'removefacetfilter(2)'
            }), {
                name: 'Language',
                action: 'removefacetfilter(2)',
                values: [
                    {
                        value: 'french',
                        action: 'removefacetfiltervalue(2,Language:french)'
                    }, {
                        value: 'english',
                        action: 'removefacetfiltervalue(2,Language:english)'
                    }
                ]
            });
        });
    });
});
