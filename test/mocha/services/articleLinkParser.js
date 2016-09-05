import articleLinkParser, * as extractor from '../../../lib/services/articleLinkParser';

describe('articleLinkParser', function () {

    it('should return directLinks, fullTextLinks, hasPdfLink and PLink', function* () {
        const result = {
            FullText: {
                Text: {
                    Availability: '1'
                },
                Links: [
                    {
                        Type: 'pdflink',
                        Url: 'https://en.wikipedia.org/wiki/Fermi_paradox'
                    }
                ],
                CustomLinks: [
                    {
                        Url: 'http://resolver.ebscohost.com/openurl',
                        Category: 'fullText',
                        Name: 'Full Text Finder'
                    }
                ],
            },
            Items: [
                {
                    Name: 'URL',
                    Label: 'Access url',
                    Data: '&lt;link linkTarget=&quot;URL&quot; linkTerm=&quot;https:\/\/clinicaltrials.gov\/show\/NCT01482923&quot; linkWindow=&quot;_blank&quot;&gt;https:\/\/clinicaltrials.gov\/show\/NCT01482923&lt;\/link&gt;'
                }, {
                    Name: 'URL',
                    Label: 'Availability',
                    Data: 'http:\/\/hdl.handle.net\/10520\/EJC189235'
                }, {
                    Name: 'not URL',
                    Label: 'A label',
                    Data: 'Some other data'
                }
            ]
        };

        assert.deepEqual(yield articleLinkParser(result), {
            fullTextLinks: [{
                name: 'Full Text Finder',
                url: 'http://resolver.ebscohost.com/openurl'
            }],
            pdfLinks: [{
                url: 'https://en.wikipedia.org/wiki/Fermi_paradox'
            }],
            urls: [
                { name: 'Access url', url: 'https:\/\/clinicaltrials.gov\/show\/NCT01482923' },
                { name: 'Availability', url: 'http:\/\/hdl.handle.net\/10520\/EJC189235' }
            ]
        });
    });

    describe('extractFullTextLinks', function () {
        it('should return array of customLinks', function() {
            assert.deepEqual(extractor.extractFullTextLinks({
                FullText: {
                    CustomLinks: [
                        {
                            Category: 'fullText',
                            Name: 'name1',
                            Url: 'url1'
                        }, {
                            Category: 'fullText',
                            Name: 'name2',
                            Url: 'url2'
                        }
                    ]
                }
            }), [
                { name: 'name1', url: 'url1' },
                { name: 'name2', url: 'url2' }
            ]);
        });

        it('should ignore customLinks that have not the fullText category', function() {
            assert.deepEqual(extractor.extractFullTextLinks({
                FullText: {
                    CustomLinks: [
                        {
                            Category: 'fullText',
                            Name: 'name1',
                            Url: 'url1'
                        }, {
                            Category: 'noFullText',
                            Name: 'name2',
                            Url: 'url2'
                        }
                    ]
                }
            }), [
                { name: 'name1', url: 'url1' }
            ]);
        });

        it('should replace all &amp; by & in all link', function () {
            assert.deepEqual(extractor.extractFullTextLinks({
                FullText: {
                    CustomLinks: [
                        {
                            Category: 'fullText',
                            Name: 'name1',
                            Url: 'url1?a=1&amp;b=2'
                        }, {
                            Category: 'fullText',
                            Name: 'name2',
                            Url: 'url2?a=1&amp;b=2&amp;c=3'
                        }
                    ]
                }
            }), [
                { name: 'name1', url: 'url1?a=1&b=2' },
                { name: 'name2', url: 'url2?a=1&b=2&c=3' }
            ]);
        });
    });

    describe('extractPdfLinks', function() {
        it('should extract pdf link', function() {
            assert.deepEqual(extractor.extractPdfLinks({
                FullText: {
                    Links: [
                        { Type: 'pdflink', Url: 'url1' },
                        { Type: 'pdflink', Url: 'url2' }
                    ]
                }
            }), [{ url: 'url1' }, { url: 'url2' }]);
        });

        it('should exclude link with type other than pdflink', function() {
            assert.deepEqual(extractor.extractPdfLinks({
                FullText: {
                    Links: [
                        { Type: 'pdflink', Url: 'url1' },
                        { Type: 'nopdflink', Url: 'url2' }
                    ]
                }
            }), [{ url: 'url1' }]);
        });

        it('should exclude link with no Url', function() {
            assert.deepEqual(extractor.extractPdfLinks({
                FullText: {
                    Links: [
                        { Type: 'pdflink', Url: 'url1' },
                        { Type: 'nopdflink' }
                    ]
                }
            }), [{ url: 'url1' }]);
        });
    });

    describe('extractAccessUrls', function () {

        it('should extract URL', function* () {
            assert.deepEqual(yield extractor.extractUrls({
                Items: [
                    {
                        Name: 'URL',
                        Label: 'Availability',
                        Data: 'http:\/\/hdl.handle.net\/10520\/EJC189235'
                    }
                ]
            }), [
                { name: 'Availability', url: 'http:\/\/hdl.handle.net\/10520\/EJC189235' }
            ]);
        });

        it('should ignore Items with Name other than URL', function* () {
            assert.deepEqual(yield extractor.extractUrls({
                Items: [
                    {
                        Name: 'not URL',
                        Label: 'A label',
                        Data: 'Some other data'
                    }
                ]
            }), []);
        });

        it('should parse extracted url if necessary', function* () {
            assert.deepEqual(yield extractor.extractUrls({
                Items: [
                    {
                        Name: 'URL',
                        Label: 'Access url',
                        Data: '&lt;link linkTarget=&quot;URL&quot; linkTerm=&quot;https:\/\/clinicaltrials.gov\/show\/NCT01482923&quot; linkWindow=&quot;_blank&quot;&gt;https:\/\/clinicaltrials.gov\/show\/NCT01482923&lt;\/link&gt;'
                    }
                ]
            }), [
                { name: 'Access url', url: 'https:\/\/clinicaltrials.gov\/show\/NCT01482923' }
            ]);
        });

        it('should return emptyArray if no Items', function* () {
            assert.deepEqual(yield extractor.extractUrls({}), []);
        });
    });

});
