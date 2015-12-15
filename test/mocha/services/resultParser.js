'use strict';

import resultParser, * as extractor from '../../../lib/services/resultParser';
import aidsResult from '../../mock/controller/aidsResult.json';

describe('resultParser', function () {

    it('should extract relevant information from ebsco raw result', function () {
        const result = aidsResult.SearchResult.Data.Records;
        assert.deepEqual(JSON.parse(JSON.stringify(result.map(resultParser))), require('./parsedAidsResult.json'));
    });

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

    describe('.extractAuthors', function () {
        it('should return list of authors for result', function () {
            const result = {
                RecordInfo: {
                    BibRecord: {
                        BibRelationships: {
                            HasContributorRelationships: [
                                {
                                    PersonEntity: {
                                        Name: {
                                            NameFull: 'Mary Curry'
                                        }
                                    }
                                }, {
                                    PersonEntity: {
                                        Name: {
                                            NameFull: 'Louis Pasteur'
                                        }
                                    }
                                }, {
                                    PersonEntity: {
                                        Name: {
                                            NameFull: 'Albert Newton'
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            };
            assert.deepEqual(extractor.extractAuthors(result), ['Mary Curry', 'Louis Pasteur', 'Albert Newton']);
        });

        it('should return null if no author found', function () {
            const result = {
                RecordInfo: {
                    BibRelationships: {}
                }
            };
            assert.deepEqual(extractor.extractAuthors(result), null);
        });
    });

    describe('extractPublicationDate', function () {

        it('should return publicationDate from result', function () {

            const result = {
                RecordInfo: {
                    BibRecord: {
                        BibRelationships:{
                            IsPartOfRelationships:[{
                                BibEntity:{
                                    Dates: [
                                        {
                                            M: 12,
                                            D: 1,
                                            Y: 2015,
                                            Type: 'published'
                                        }
                                    ]
                                }
                            }]
                        }
                    }
                }
            };

            assert.deepEqual(extractor.extractPublicationDate(result), new Date('12/01/2015'));
        });

        it('should return null if date is invalid', function () {
            const result = {
                RecordInfo: {
                    BibRecord: {
                        BibRelationships:{
                            IsPartOfRelationships:[{
                                BibEntity:{
                                    Dates: [
                                        {
                                            M: 99,
                                            D: 99,
                                            Y: 2015,
                                            Type: 'published'
                                        }
                                    ]
                                }
                            }]
                        }
                    }
                }
            };

            assert.deepEqual(extractor.extractPublicationDate(result), null);
        });

        it('should return null if no date is found', function () {
            const result = {
                RecordInfo: {
                    BibRelationships:{
                        IsPartOfRelationships:{
                            BibEntity:{}
                        }
                    }
                }
            };

            assert.deepEqual(extractor.extractPublicationDate(result), null);
        });
    });

    describe('extractLanguages', function () {

        it('should return languages from result', function () {
            const result = {
                RecordInfo: {
                    BibRecord:{
                        BibEntity:{
                            Languages: [
                                {
                                    Code: 'eng',
                                    Text: 'English'
                                }, {
                                    Code: 'fra',
                                    Text: 'French'
                                }
                            ]
                        }
                    }
                }
            };

            assert.deepEqual(extractor.extractLanguages(result), ['English', 'French']);
        });

        it('should return null if no language is found', function () {
            const result = {
                RecordInfo: {
                    BibRecord:{
                        BibEntity:{}
                    }
                }
            };

            assert.deepEqual(extractor.extractLanguages(result), null);
        });
    });

    describe('extractDatabase', function () {

        it('should return database from result', function () {
            const result = {
                Header: {
                    DbLabel: 'mysql?'
                }
            };

            assert.equal(extractor.extractDatabase(result), 'mysql?');
        });

        it('should return null if no database is found', function () {
            const result = {
                Header: {}
            };

            assert.isNull(extractor.extractDatabase(result));
        });

    });

    describe('extracSubjects', function () {

        it('should return subject list from result', function () {
            const result = {
                RecordInfo: {
                    BibRecord:{
                        BibEntity:{
                            Subjects: [
                                {
                                    SubjectFull: 'The fermi paradox'
                                }, {
                                    SubjectFull: `Hempel's ravens`
                                }
                            ]
                        }
                    }
                }
            };

            assert.deepEqual(extractor.extractSubjects(result), [ 'The fermi paradox', `Hempel's ravens` ]);
        });

        it('should return null if no subjects is found', function () {
            const result = {
                RecordInfo: {}
            };

            assert.isNull(extractor.extractSubjects(result));
        });

    });

    describe('extractPublicationType', function () {

        it('should return pubType from result', function () {
            const result = {
                Header: {
                    PubType: 'Academic Journal'
                }
            };

            assert.equal(extractor.extractPublicationType(result), 'Academic Journal');
        });

        it('should return pubId if no PubType and PubId not unknown from result', function () {
            const result = {
                Header: {
                    PubType: '',
                    PubId: 'Academic Journal'
                }
            };

            assert.equal(extractor.extractPublicationType(result), 'Academic Journal');
        });

        it('should return "Dissertation/ Thesis" if no PubType and PubId unknown and DbId is edsndl', function () {
            const result = {
                Header: {
                    PubType: '',
                    PubId: 'unknown',
                    DbId: 'edsndl'
                }
            };

            assert.equal(extractor.extractPublicationType(result), 'Dissertation/ Thesis');
        });

        it('should return items TypePub data if no PubType and PubId unknown from result', function () {
            const result = {
                Header: {
                    PubType: '',
                    PubId: 'unknown'
                },
                Items: [
                    {
                        Name: 'title',
                        Data: 'the title'
                    }, {
                        Name: 'TypePub',
                        Data: 'Academic Journal'
                    }
                ]
            };

            assert.equal(extractor.extractPublicationType(result), 'Academic Journal');
        });

        it('should return null if no publicationType is found', function () {
            const result = {
                RecordInfo: {}
            };

            assert.isNull(extractor.extractPublicationType(result));
        });

    });

    describe('extractArticleLink', function () {

        it('should return direct articleLink from result Items', function () {
            const result = {
                PLink: 'https://en.wikipedia.org/wiki/Fermi_paradox',
                FullText: {
                    CustomLinks: [
                        { Url: 'https://en.wikipedia.org/wiki/Fermi_paradox' }
                    ]
                },
                Items: [
                    {
                        Name: 'URL',
                        Data: 'https://fr.wikipedia.org/wiki/Paradoxe_de_Hempel'
                    }
                ]
            };

            assert.equal(extractor.extractArticleLink(result), 'https://fr.wikipedia.org/wiki/Paradoxe_de_Hempel');
        });

        it('should return resolver Link from result fullText if no direct link', function () {
            const result = {
                PLink: 'https://en.wikipedia.org/wiki/Fermi_paradox',
                FullText: {
                    CustomLinks: [
                        { Url: 'http://resolver.ebscohost.com/openurl' }
                    ]
                }
            };

            assert.equal(extractor.extractArticleLink(result), 'http://resolver.ebscohost.com/openurl');
        });

        it('should return noticeLink from result if no direct nor resolver link', function () {
            const result = {
                PLink: 'https://en.wikipedia.org/wiki/Fermi_paradox'
            };

            assert.equal(extractor.extractArticleLink(result), 'https://en.wikipedia.org/wiki/Fermi_paradox');
        });

        it('should return null if no link is found', function () {
            const result = {
                Items: [
                    {
                        Name: 'Whatever',
                        Data: 'https://fr.wikipedia.org/wiki/Paradoxe_de_Hempel'
                    }
                ]
            };

            assert.isNull(extractor.extractArticleLink(result));
        });

    });

    describe('extractSource', function () {

        it('should return sourceTitle from result', function () {
            const result = {
                Items: [
                    {
                        Name: 'TitleSource',
                        Data: 'Here is my source.'
                    }
                ]
            };

            assert.equal(extractor.extractSource(result), 'Here is my source.');
        });

        it('should return sourceTitle from result without the xml tag if any', function () {
            const result = {
                Items: [
                    {
                        Name: 'TitleSource',
                        Data: '&lt;SearchLink attr="whatever"&gt;Here is&lt;/SearchLink&gt; &lt;i&gt;my&lt;/i&gt; source.'
                    }
                ]
            };

            assert.equal(extractor.extractSource(result), 'Here is my source.');
        });

        it('should return null if no source', function () {
            const result = {
                Items: [
                    {
                        Name: 'Something',
                        Data: 'whatever'
                    }
                ]
            };

            assert.isNull(extractor.extractSource(result));
        });
    });

    describe('extractAbstract', function () {

        it('should return abstract from result', function () {
            const result = {
                Items: [
                    {
                        Name: 'Abstract',
                        Data: 'Here is the resume.'
                    }
                ]
            };

            assert.equal(extractor.extractAbstract(result), 'Here is the resume.');
        });

        it('should reblace br in abstract by \n', function () {
            const result = {
                Items: [
                    {
                        Name: 'Abstract',
                        Data: 'Here is&lt;br&gt;the resume.&lt;br/&gt;On several lines.&lt;br /&gt;OK'
                    }
                ]
            };

            assert.equal(extractor.extractAbstract(result), 'Here is\nthe resume.\nOn several lines.\nOK');
        });

        it('should remove xml in abstract', function () {
            const result = {
                Items: [
                    {
                        Name: 'Abstract',
                        Data: 'Here is&lt;br&gt;the &lt;supers&gt;resume&lt;/supers&gt;.&lt;br/&gt;On several lines.&lt;br /&gt;OK'
                    }
                ]
            };

            assert.equal(extractor.extractAbstract(result), 'Here is\nthe resume.\nOn several lines.\nOK');
        });

        it('should replace &lt; and $gt; by < and > if they are not part of a tag', function () {
            const result = {
                Items: [
                    {
                        Name: 'Abstract',
                        Data: 'Here is&lt;br&gt;the &lt;supers&gt;resume&lt;/supers&gt;.&lt;br/&gt;On several lines.&lt;br /&gt;(&gt;_&lt;)'
                    }
                ]
            };

            assert.equal(extractor.extractAbstract(result), 'Here is\nthe resume.\nOn several lines.\n(>_<)');
        });

        it('should return null if no abstract', function () {
            const result = {
                Items: [
                    {
                        Name: 'Something',
                        Data: 'whatever'
                    }
                ]
            };

            assert.isNull(extractor.extractSource(result));
        });
    });

});
