import * as extractor from '../../../lib/services/publicationParser';

describe('publicationParser', function() {
    describe('.extractTitle', function() {
        it('return title of given result', function() {
            const result = {
                ResultId: 1,
                RecordInfo: {
                    BibRecord: {
                        BibEntity: {
                            Titles: [
                                {
                                    Type: 'other',
                                    TitleFull: 'other title',
                                },
                                {
                                    Type: 'main',
                                    TitleFull: 'main title',
                                },
                            ],
                        },
                    },
                },
            };
            assert.equal(extractor.extractTitle(result), 'main title');
        });

        it('return null if no title found', function() {
            const result = {
                ResultId: 1,
                RecordInfo: {
                    BibRecord: {},
                },
            };
            assert.equal(extractor.extractTitle(result), null);
        });

        it('return null if no main title found', function() {
            const result = {
                ResultId: 1,
                RecordInfo: {
                    BibRecord: {
                        BibEntity: {
                            Titles: [
                                {
                                    Type: 'other',
                                    TitleFull: 'other title',
                                },
                            ],
                        },
                    },
                },
            };
            assert.equal(extractor.extractTitle(result), null);
        });
    });

    describe('.extractISBNOnline', function() {
        it('should extract isbn-online from result', function() {
            const result = {
                ResultId: 1,
                RecordInfo: {
                    BibRecord: {
                        BibEntity: {
                            Identifiers: [
                                {
                                    Type: 'isbn-print',
                                    Value: '9780415908740',
                                },
                                {
                                    Type: 'isbn-online',
                                    Value: '9781135964559',
                                },
                                {
                                    Type: 'isbn-online',
                                    Value: '9781283837637',
                                },
                                {
                                    Type: 'doid',
                                    Value: 'NL$83216$PDF',
                                },
                                {
                                    Type: 'ebookid',
                                    Value: '83216',
                                },
                            ],
                        },
                    },
                },
            };
            assert.deepEqual(extractor.extractISBNOnline(result), [
                '9781135964559',
                '9781283837637',
            ]);
        });
    });

    describe('.extractISBNPrint', function() {
        it('should extract isbn-print from result', function() {
            const result = {
                ResultId: 1,
                RecordInfo: {
                    BibRecord: {
                        BibEntity: {
                            Identifiers: [
                                {
                                    Type: 'isbn-print',
                                    Value: '9780415908740',
                                },
                                {
                                    Type: 'isbn-online',
                                    Value: '9781135964559',
                                },
                                {
                                    Type: 'isbn-online',
                                    Value: '9781283837637',
                                },
                                {
                                    Type: 'doid',
                                    Value: 'NL$83216$PDF',
                                },
                                {
                                    Type: 'ebookid',
                                    Value: '83216',
                                },
                            ],
                        },
                    },
                },
            };
            assert.deepEqual(extractor.extractISBNPrint(result), [
                '9780415908740',
            ]);
        });
    });

    describe('.extractISSNOnline', function() {
        it('should extract isbn-online from result', function() {
            const result = {
                ResultId: 1,
                RecordInfo: {
                    BibRecord: {
                        BibEntity: {
                            Identifiers: [
                                {
                                    Type: 'isbn-print',
                                    Value: '9780415908740',
                                },
                                {
                                    Type: 'issn-online',
                                    Value: '9781135964559',
                                },
                                {
                                    Type: 'isbn-online',
                                    Value: '9781283837637',
                                },
                                {
                                    Type: 'doid',
                                    Value: 'NL$83216$PDF',
                                },
                                {
                                    Type: 'ebookid',
                                    Value: '83216',
                                },
                            ],
                        },
                    },
                },
            };
            assert.deepEqual(extractor.extractISSNOnline(result), [
                '9781135964559',
            ]);
        });
    });

    describe('.extractISSNPrint', function() {
        it('should extract issn-print from result', function() {
            const result = {
                ResultId: 1,
                RecordInfo: {
                    BibRecord: {
                        BibEntity: {
                            Identifiers: [
                                {
                                    Type: 'issn-print',
                                    Value: '9780415908740',
                                },
                                {
                                    Type: 'issn-online',
                                    Value: '9781135964559',
                                },
                                {
                                    Type: 'isbn-online',
                                    Value: '9781283837637',
                                },
                                {
                                    Type: 'doid',
                                    Value: 'NL$83216$PDF',
                                },
                                {
                                    Type: 'ebookid',
                                    Value: '83216',
                                },
                            ],
                        },
                    },
                },
            };
            assert.deepEqual(extractor.extractISSNPrint(result), [
                '9780415908740',
            ]);
        });
    });

    describe('extractFullTextHoldings', function() {
        const fullTextHolding1 = {
            URL:
                'http://gate3.inist.fr/login?url=http://search.ebscohost.com/direct.asp?db=ehh&jid=13K4&scope=site',
            Name: 'Education Research Complete',
            CoverageDates: [
                {
                    StartDate: '19970101',
                    EndDate: '19971231',
                },
            ],
            CoverageStatement: '01/01/1997 - 12/31/1997',
            Databases: ['ehh'],
            Embargo: 18,
            EmbargoUnit: 'Month',
            EmbargoDescription: 'Full Text Delay: 18 Months',
            Facts: [
                {
                    Key: 'packagename',
                    Value: 'Education Research Complete',
                },
                {
                    Key: 'vendorid',
                    Value: 19,
                },
                {
                    Key: 'dbname',
                    Value: 'ehh',
                },
                {
                    Key: 'packagetitlelink',
                    Value:
                        'http://search.ebscohost.com/direct.asp?db=ehh&jid=13K4&scope=site',
                },
                {
                    Key: 'btitle',
                    Value: 'Teaching AIDS',
                },
                {
                    Key: 'GenericTitle',
                    Value: 'Teaching AIDS',
                },
            ],
        };

        const fullTextHolding2 = {
            URL:
                'http://gate3.inist.fr/login?url=https://muse.jhu.edu/journal/420',
            Name: 'Project MUSE - Premium Collection',
            CoverageDates: [
                {
                    StartDate: '20090101',
                    EndDate: '99991231',
                },
            ],
            CoverageStatement: '01/01/2009 - present',
            EmbargoUnit: 'Week',
            EmbargoDescription: '',
            Facts: [
                {
                    Key: 'packagename',
                    Value: 'Project MUSE - Premium Collection',
                },
                {
                    Key: 'vendorid',
                    Value: '62',
                },
                {
                    Key: 'packagetitlelink',
                    Value: 'https://muse.jhu.edu/journal/420',
                },
                {
                    Key: 'GenericTitle',
                    Value: 'Romani Studies',
                },
                {
                    Key: 'jtitle',
                    Value: 'Romani Studies',
                },
            ],
        };

        it('should parse result.FullTextHoldings and sort result by end date', function() {
            assert.deepEqual(
                extractor.extractFullTextHoldings({
                    FullTextHoldings: [fullTextHolding1, fullTextHolding2],
                }),
                [
                    {
                        coverage: [
                            {
                                end: {
                                    day: '31',
                                    month: '12',
                                    year: '9999',
                                },
                                start: {
                                    day: '01',
                                    month: '01',
                                    year: '2009',
                                },
                            },
                        ],
                        embargo: undefined,
                        isCurrent: true,
                        name: 'Project MUSE - Premium Collection',
                        url:
                            'http://gate3.inist.fr/login?url=https://muse.jhu.edu/journal/420',
                    },
                    {
                        coverage: [
                            {
                                end: {
                                    day: '31',
                                    month: '12',
                                    year: '1997',
                                },
                                start: {
                                    day: '01',
                                    month: '01',
                                    year: '1997',
                                },
                            },
                        ],
                        embargo: {
                            unit: 'Month',
                            value: 18,
                        },
                        isCurrent: false,
                        name: 'Education Research Complete',
                        url:
                            'http://gate3.inist.fr/login?url=http://search.ebscohost.com/direct.asp?db=ehh&jid=13K4&scope=site',
                    },
                ],
            );
        });

        it('should prioritize link without embargo', () => {
            assert.deepEqual(
                extractor.extractFullTextHoldings({
                    FullTextHoldings: [
                        {
                            Name: 1,
                            URL: 1,
                            CoverageDates: [
                                {
                                    StartDate: '20090101',
                                    EndDate: '99991231',
                                },
                            ],
                            Embargo: 3,
                            EmbargoUnit: 'Week',
                        },
                        {
                            Name: 2,
                            URL: 2,
                            CoverageDates: [
                                {
                                    StartDate: '20090101',
                                    EndDate: '99991231',
                                },
                            ],
                            EmbargoUnit: 'Week',
                        },
                    ],
                }),
                [
                    {
                        name: 2,
                        url: 2,
                        coverage: [
                            {
                                end: {
                                    day: '31',
                                    month: '12',
                                    year: '9999',
                                },
                                start: {
                                    day: '01',
                                    month: '01',
                                    year: '2009',
                                },
                            },
                        ],
                        embargo: undefined,
                        isCurrent: true,
                    },
                    {
                        name: 1,
                        url: 1,
                        coverage: [
                            {
                                end: {
                                    day: '31',
                                    month: '12',
                                    year: '9999',
                                },
                                start: {
                                    day: '01',
                                    month: '01',
                                    year: '2009',
                                },
                            },
                        ],
                        embargo: { value: 3, unit: 'Week' },
                        isCurrent: true,
                    },
                ],
            );
        });

        it('should sort by embargo', () => {
            assert.deepEqual(
                extractor.extractFullTextHoldings({
                    FullTextHoldings: [
                        {
                            Name: 1,
                            URL: 1,
                            CoverageDates: [
                                {
                                    StartDate: '20090101',
                                    EndDate: '99991231',
                                },
                            ],
                            Embargo: 1,
                            EmbargoUnit: 'Month',
                        },
                        {
                            Name: 2,
                            URL: 2,
                            CoverageDates: [
                                {
                                    StartDate: '20090101',
                                    EndDate: '99991231',
                                },
                            ],
                            Embargo: 1,
                            EmbargoUnit: 'Week',
                        },
                    ],
                }),
                [
                    {
                        name: 2,
                        url: 2,
                        coverage: [
                            {
                                end: {
                                    day: '31',
                                    month: '12',
                                    year: '9999',
                                },
                                start: {
                                    day: '01',
                                    month: '01',
                                    year: '2009',
                                },
                            },
                        ],
                        embargo: { value: 1, unit: 'Week' },
                        isCurrent: true,
                    },
                    {
                        name: 1,
                        url: 1,
                        coverage: [
                            {
                                end: {
                                    day: '31',
                                    month: '12',
                                    year: '9999',
                                },
                                start: {
                                    day: '01',
                                    month: '01',
                                    year: '2009',
                                },
                            },
                        ],
                        embargo: { value: 1, unit: 'Month' },
                        isCurrent: true,
                    },
                ],
            );
        });

        it('should return empty array if no result.FullTextHoldings', function() {
            assert.deepEqual(extractor.extractFullTextHoldings({}), []);
        });

        it('should return work even if no coverageDates', function() {
            assert.deepEqual(
                extractor.extractFullTextHoldings({
                    FullTextHoldings: [
                        {
                            URL:
                                'http://gate3.inist.fr/login?url=https://muse.jhu.edu/journal/420',
                            Name: 'Project MUSE - Premium Collection',
                            Facts: [
                                {
                                    Key: 'packagename',
                                    Value: 'Project MUSE - Premium Collection',
                                },
                                {
                                    Key: 'vendorid',
                                    Value: '62',
                                },
                                {
                                    Key: 'packagetitlelink',
                                    Value: 'https://muse.jhu.edu/journal/420',
                                },
                                {
                                    Key: 'GenericTitle',
                                    Value: 'Romani Studies',
                                },
                                {
                                    Key: 'jtitle',
                                    Value: 'Romani Studies',
                                },
                            ],
                        },
                    ],
                }),
                [
                    {
                        coverage: undefined,
                        embargo: undefined,
                        isCurrent: false,
                        name: 'Project MUSE - Premium Collection',
                        url:
                            'http://gate3.inist.fr/login?url=https://muse.jhu.edu/journal/420',
                    },
                ],
            );
        });

        describe('.parseFullTextHolding', function() {
            it('should parse fullTextHolding', function() {
                assert.deepEqual(
                    extractor.parseFullTextHolding(fullTextHolding1),
                    {
                        url:
                            'http://gate3.inist.fr/login?url=http://search.ebscohost.com/direct.asp?db=ehh&jid=13K4&scope=site',
                        name: 'Education Research Complete',
                        coverage: [
                            {
                                start: {
                                    year: '1997',
                                    month: '01',
                                    day: '01',
                                },
                                startIndex: '19970101',
                                end: {
                                    year: '1997',
                                    month: '12',
                                    day: '31',
                                },
                                endIndex: '19971231',
                            },
                        ],
                        embargo: {
                            value: 18,
                            unit: 'Month',
                        },
                        isCurrent: false,
                    },
                );
            });
            it('should set isCurrent to true if end date is year 9999', function() {
                assert.deepEqual(
                    extractor.parseFullTextHolding(fullTextHolding2),
                    {
                        url:
                            'http://gate3.inist.fr/login?url=https://muse.jhu.edu/journal/420',
                        name: 'Project MUSE - Premium Collection',
                        coverage: [
                            {
                                start: {
                                    year: '2009',
                                    month: '01',
                                    day: '01',
                                },
                                startIndex: '20090101',
                                end: {
                                    year: '9999',
                                    month: '12',
                                    day: '31',
                                },
                                endIndex: '99991231',
                            },
                        ],
                        embargo: undefined,
                        isCurrent: true,
                    },
                );
            });
        });
    });
});
