import { parse, unparse } from '../../../lib/services/activeFacetParser';

describe('activeFacetParser', function () {
    describe('parse', function () {
        it('should return an empty object if called with no rawActiveFacets', function () {
            assert.deepEqual(parse(), {});
        });

        it('should return an empty object if called with an empty arraa', function () {
            assert.deepEqual(parse([]), {});
        });

        it('should return a literal with [Id]: [Value]', function () {
            assert.deepEqual(
                parse([
                    {
                        FilterId: 1,
                        FacetValues: [
                            {
                                Id: 'Language',
                                Value: 'french',
                            },
                        ],
                    },
                    {
                        FilterId: 2,
                        FacetValues: [
                            {
                                Id: 'SourceType',
                                Value: 'Non-Print Resources',
                            },
                        ],
                    },
                ]),
                {
                    Language: ['french'],
                    SourceType: ['Non-Print Resources'],
                },
            );
        });

        it('should concatene several on the same Id', function () {
            assert.deepEqual(
                parse([
                    {
                        FilterId: 1,
                        FacetValues: [
                            {
                                Id: 'Language',
                                Value: 'french',
                            },
                        ],
                    },
                    {
                        FilterId: 2,
                        FacetValues: [
                            {
                                Id: 'Language',
                                Value: 'english',
                            },
                        ],
                    },
                ]),
                {
                    Language: ['french', 'english'],
                },
            );
        });
    });

    describe('unparse', function () {
        it('should return rawFacetActiveFacets from parsed one', function () {
            assert.deepEqual(
                unparse({
                    Language: ['french', 'english'],
                    SourceType: ['Non-Print Resources'],
                }),
                [
                    {
                        FilterId: 1,
                        FacetValues: [
                            {
                                Id: 'Language',
                                Value: 'french',
                            },
                            {
                                Id: 'Language',
                                Value: 'english',
                            },
                        ],
                    },
                    {
                        FilterId: 2,
                        FacetValues: [
                            {
                                Id: 'SourceType',
                                Value: 'Non-Print Resources',
                            },
                        ],
                    },
                ],
            );
        });
    });
});
