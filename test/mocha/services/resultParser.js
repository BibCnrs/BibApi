'use strict';

import resultParser, * as extractor from '../../../lib/services/resultParser';
import aidsResult from '../../mock/controller/aidsResult.json';

describe('resultParser', function () {

    it('should extract relevant information from ebsco raw result', function () {
        const result = aidsResult.SearchResult.Data.Records;
        assert.deepEqual(JSON.parse(JSON.stringify(result.map(resultParser))), require('./parsedAidsResult.json').results);
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

        it('should return pdflink FullText Links contain on type = pdflink', function () {
            const result = {
                PLink: 'https://en.wikipedia.org/wiki/Fermi_paradox',
                Items: [
                    {
                        Name: 'URL',
                        Data: 'https://fr.wikipedia.org/wiki/Paradoxe_de_Hempel'
                    }
                ],
                FullText: {
                    Text: {
                        Availability: '1'
                    },
                    Links: [
                        { Type: 'pdflink' }
                    ],
                    CustomLinks: [
                        { Url: 'http://resolver.ebscohost.com/openurl' }
                    ]
                }
            };

            assert.equal(extractor.extractArticleLink(result), 'pdflink');
        });

        it('should return PLink from result if FullText Availability is 1', function () {
            const result = {
                PLink: 'https://en.wikipedia.org/wiki/Fermi_paradox',
                Items: [
                    {
                        Name: 'URL',
                        Data: 'https://fr.wikipedia.org/wiki/Paradoxe_de_Hempel'
                    }
                ],
                FullText: {
                    Text: {
                        Availability: '1'
                    },
                    CustomLinks: [
                        { Url: 'http://resolver.ebscohost.com/openurl' }
                    ]
                }
            };

            assert.equal(extractor.extractArticleLink(result), 'https://en.wikipedia.org/wiki/Fermi_paradox');
        });

        it('should return resolverLink if FullText Availability is 0', function () {
            const result = {
                PLink: 'https://en.wikipedia.org/wiki/Fermi_paradox',
                Items: [
                    {
                        Name: 'URL',
                        Data: 'https://fr.wikipedia.org/wiki/Paradoxe_de_Hempel'
                    }
                ],
                FullText: {
                    Availability: '0',
                    CustomLinks: [
                        { Url: 'http://resolver.ebscohost.com/openurl' }
                    ]
                }
            };

            assert.equal(extractor.extractArticleLink(result), 'http://resolver.ebscohost.com/openurl');
        });

        it('should return direct articleLink from result Items if no resolverLink', function () {
            const result = {
                PLink: 'https://en.wikipedia.org/wiki/Fermi_paradox',
                Items: [
                    {
                        Name: 'URL',
                        Data: 'https://fr.wikipedia.org/wiki/Paradoxe_de_Hempel'
                    }
                ]
            };

            assert.equal(extractor.extractArticleLink(result), 'https://fr.wikipedia.org/wiki/Paradoxe_de_Hempel');
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

        describe('extractDirectLink', function () {
            it('should return first pdf link if there is one', function () {
                const UrlData = '&lt;link linkTarget=&quot;URL&quot; linkTerm=&quot;http://urn.kb.se/resolve?urn=urn:nbn:se:hh:diva-28193&quot; linkWindow=&quot;_blank&quot;&gt;http://urn.kb.se/resolve?urn=urn:nbn:se:hh:diva-28193&lt;/link&gt;&lt;br /&gt;&lt;link linkTarget=&quot;URL&quot; linkTerm=&quot;http://iiste.org/Journals/index.php/JMCR/article/view/21738&quot; linkWindow=&quot;_blank&quot;&gt;http://iiste.org/Journals/index.php/JMCR/article/view/21738&lt;/link&gt;&lt;br /&gt;&lt;link linkTarget=&quot;URL&quot; linkTerm=&quot;http://hh.diva-portal.org/smash/get/diva2:809311/FULLTEXT02.pdf&quot; linkWindow=&quot;_blank&quot;&gt;http://hh.diva-portal.org/smash/get/diva2:809311/FULLTEXT02.pdf&lt;/link&gt;';

                assert.equal(extractor.extractDirectLink({
                    Items: [
                        {
                            Name: 'URL',
                            Data: UrlData
                        }
                    ]
                }), 'http://hh.diva-portal.org/smash/get/diva2:809311/FULLTEXT02.pdf');
            });

            it('should return first link if no pdf', function () {
                const UrlData = '&lt;link linkTarget=&quot;URL&quot; linkTerm=&quot;http://urn.kb.se/resolve?urn=urn:nbn:se:hh:diva-28193&quot; linkWindow=&quot;_blank&quot;&gt;http://urn.kb.se/resolve?urn=urn:nbn:se:hh:diva-28193&lt;/link&gt;&lt;br /&gt;&lt;link linkTarget=&quot;URL&quot; linkTerm=&quot;http://iiste.org/Journals/index.php/JMCR/article/view/21738&quot; linkWindow=&quot;_blank&quot;&gt;http://iiste.org/Journals/index.php/JMCR/article/view/21738&lt;/link&gt;&lt;br /&gt;';

                assert.equal(extractor.extractDirectLink({
                    Items: [
                        {
                            Name: 'URL',
                            Data: UrlData
                        }
                    ]
                }), 'http://urn.kb.se/resolve?urn=urn:nbn:se:hh:diva-28193');
            });

            it('should return link if only one link', function () {
                const data = {
                    Items: [
                        {
                            Name: 'URL',
                            Data: '&lt;link linkTarget=&quot;URL&quot; linkTerm=&quot;http://ndhadeliver.natlib.govt.nz/delivery/DeliveryManagerServlet?dps_pid=IE24710021&quot; linkWindow=&quot;_blank&quot;&gt;http://ndhadeliver.natlib.govt.nz/delivery/DeliveryManagerServlet?dps_pid=IE24710021&lt;/link&gt;'
                        }
                    ]
                };
                assert.equal(extractor.extractDirectLink(data), 'http://ndhadeliver.natlib.govt.nz/delivery/DeliveryManagerServlet?dps_pid=IE24710021');
            });
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
