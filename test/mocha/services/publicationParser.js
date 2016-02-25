import * as extractor from '../../../lib/services/publicationParser';

describe('publicationParser', function () {

    describe('.extractTitle', function () {
        it('return title of given result', function* () {
            const result = {
                ResultId: 1,
                RecordInfo: {
                    BibRecord: {
                        BibEntity: {
                            Titles: [
                                {
                                    Type: 'other',
                                    TitleFull: 'other title'
                                },
                                {
                                    Type: 'main',
                                    TitleFull: 'main title'
                                }
                            ]
                        }
                    }
                }
            };
            assert.equal(extractor.extractTitle(result), 'main title');
        });

        it('return null if no title found', function* () {
            const result = {
                ResultId: 1,
                RecordInfo: {
                    BibRecord: {
                    }
                }
            };
            assert.equal(extractor.extractTitle(result), null);
        });

        it('return null if no main title found', function* () {
            const result = {
                ResultId: 1,
                RecordInfo: {
                    BibRecord: {
                        BibEntity: {
                            Titles: [
                                {
                                    Type: 'other',
                                    TitleFull: 'other title'
                                }
                            ]
                        }
                    }
                }
            };
            assert.equal(extractor.extractTitle(result), null);
        });
    });

    describe('.extractISBN', function () {

        it('should extract isbn from result', function () {
            const result = {
                ResultId: 1,
                RecordInfo: {
                    BibRecord: {
                        BibEntity: {
                            Identifiers: [
                                {
                                    Type: 'isbn-print',
                                    Value: '9780203406008'
                                }, {
                                    Type: 'isbn-print',
                                    Value: '9780415908741'
                                }, {
                                    Type: 'issn-online',
                                    Value: '9780203406007'
                                }, {
                                    Type: 'issn-online',
                                    Value: '9780585448503'
                                }, {
                                    Type: 'isbn-online',
                                    Value: '9781135964559'
                                }, {
                                    Type: 'isbn-online',
                                    Value: '9781283837637'
                                }, {
                                    Type: 'doid',
                                    Value: 'NL$83216$PDF'
                                }, {
                                    Type: 'ebookid',
                                    Value: '83216'
                                }
                            ]
                        }
                    }
                }
            };
            assert.equal(extractor.extractISBN(result), '9781135964559, 9781283837637');
        });
    });

    describe('.extractISSN', function () {

        it('should extract issn from result', function () {
            const result = {
                ResultId: 1,
                RecordInfo: {
                    BibRecord: {
                        BibEntity: {
                            Identifiers: [
                                {
                                    Type: 'isbn-print',
                                    Value: '9780203406008'
                                }, {
                                    Type: 'isbn-print',
                                    Value: '9780415908741'
                                }, {
                                    Type: 'issn-online',
                                    Value: '9780203406007'
                                }, {
                                    Type: 'issn-online',
                                    Value: '9780585448503'
                                }, {
                                    Type: 'isbn-online',
                                    Value: '9781135964559'
                                }, {
                                    Type: 'isbn-online',
                                    Value: '9781283837637'
                                }, {
                                    Type: 'doid',
                                    Value: 'NL$83216$PDF'
                                }, {
                                    Type: 'ebookid',
                                    Value: '83216'
                                }
                            ]
                        }
                    }
                }
            };
            assert.equal(extractor.extractISSN(result), '9780203406007, 9780585448503');
        });
    });

    describe('.parseFullTextHolding', function () {
        it('should pars fullTextHolding', function () {
            assert.deepEqual(extractor.parseFullTextHolding({
                URL: 'http://gate3.inist.fr/login?url=http://search.ebscohost.com/direct.asp?db=ehh&jid=13K4&scope=site',
                Name: 'Education Research Complete',
                CoverageDates: [{
                    StartDate: '19970101',
                    EndDate: '19971231'
                }],
                CoverageStatement: '01/01/1997 - 12/31/1997',
                Databases: ['ehh'],
                Embargo: 18,
                EmbargoUnit: 'Month',
                EmbargoDescription: 'Full Text Delay: 18 Months',
                Facts: [{
                    Key: 'packagename',
                    Value: 'Education Research Complete'
                }, {
                    Key: 'vendorid',
                    Value: 19
                }, {
                    Key: 'dbname',
                    Value: 'ehh'
                }, {
                    Key: 'packagetitlelink',
                    Value: 'http:\/\/search.ebscohost.com\/direct.asp?db=ehh&jid=13K4&scope=site'
                }, {
                    Key: 'btitle',
                    Value: 'Teaching AIDS'
                }, {
                    Key: 'GenericTitle',
                    Value: 'Teaching AIDS'
                }]
            }), {
                url: 'http://gate3.inist.fr/login?url=http://search.ebscohost.com/direct.asp?db=ehh&jid=13K4&scope=site',
                name: 'Education Research Complete',
                coverage: [{
                    start: '01/01/1997',
                    end: '12/31/1997'
                }],
                embargo: {
                    value: 18,
                    unit: 'Month'
                }
            });
        });
    });
});
