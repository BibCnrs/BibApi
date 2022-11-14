import articleLinkParser, * as extractor from '../../../lib/services/articleLinkParser';

describe('articleLinkParser', function () {
    it('should return directLinks, fullTextLinks, hasPdfLink and PLink', function* () {
        const result = {
            RecordInfo: {
                BibRecord: {
                    BibEntity: {
                        Titles: [
                            {
                                TitleFull: 'title',
                                Type: 'main',
                            },
                        ],
                    },
                },
            },
            FullText: {
                Text: {
                    Availability: '1',
                    Value: `&lt;anid&gt;anid&lt;/anid&gt;
&lt;title&gt;title&lt;/title&gt;
&lt;hd&gt;subtitle&lt;/hd&gt;
&lt;p&gt;text&lt;/p&gt;
&lt;ulist&gt;
    &lt;item&gt;list item&lt;/item&gt;
&lt;/ulist&gt;`,
                },
                Links: [
                    {
                        Type: 'pdflink',
                        Url: 'https://en.wikipedia.org/wiki/Fermi_paradox',
                    },
                ],
                CustomLinks: [
                    {
                        Url: 'http://resolver.ebscohost.com/openurl',
                        Category: 'fullText',
                        Text: 'Full Text Finder',
                    },
                ],
            },
            Items: [
                {
                    Name: 'URL',
                    Label: 'Access url',
                    Data: '&lt;link linkTarget=&quot;URL&quot; linkTerm=&quot;https://clinicaltrials.gov/show/NCT01482923&quot; linkWindow=&quot;_blank&quot;&gt;https://clinicaltrials.gov/show/NCT01482923&lt;/link&gt;',
                },
                {
                    Name: 'URL',
                    Label: 'Availability',
                    Data: 'http://hdl.handle.net/10520/EJC189235',
                },
                {
                    Name: 'not URL',
                    Label: 'A label',
                    Data: 'Some other data',
                },
            ],
        };

        assert.deepEqual(yield articleLinkParser(result, 'INSB'), {
            fullTextLinks: [
                {
                    name: 'Full Text Finder',
                    url: 'http://resolver.ebscohost.com/openurl',
                },
            ],
            pdfLinks: [
                {
                    url: 'https://en.wikipedia.org/wiki/Fermi_paradox',
                },
            ],
            html: `<html>
    <head>
        <title>title</title>
    </head>
    <body>
        <anid>anid</anid>
<h1>title</h1>
<h2>subtitle</h2>
<p>text</p>
<ul>
    <li>list item</li>
</ul>
    </body>
</html>`,
            urls: [
                {
                    name: 'Access url',
                    url: 'https://clinicaltrials.gov/show/NCT01482923',
                },
                {
                    name: 'Availability',
                    url: 'http://hdl.handle.net/10520/EJC189235',
                },
            ],
        });
    });

    describe('extractFullTextLinks', function () {
        it('should return array of customLinks', function () {
            assert.deepEqual(
                extractor.extractFullTextLinks({
                    FullText: {
                        CustomLinks: [
                            {
                                Category: 'fullText',
                                Text: 'name1',
                                Url: 'http://url1',
                            },
                            {
                                Category: 'fullText',
                                Text: 'name2',
                                Url: 'http://url2',
                            },
                        ],
                    },
                }),
                [
                    { name: 'name1', url: 'http://url1' },
                    { name: 'name2', url: 'http://url2' },
                ],
            );
        });

        it('should ignore customLinks that have not the fullText category', function () {
            assert.deepEqual(
                extractor.extractFullTextLinks({
                    FullText: {
                        CustomLinks: [
                            {
                                Category: 'fullText',
                                Text: 'name1',
                                Url: 'http://url1',
                            },
                            {
                                Category: 'noFullText',
                                Text: 'name2',
                                Url: 'http://url2',
                            },
                        ],
                    },
                }),
                [{ name: 'name1', url: 'http://url1' }],
            );
        });

        it('should replace all &amp; by & in all link', function () {
            assert.deepEqual(
                extractor.extractFullTextLinks({
                    FullText: {
                        CustomLinks: [
                            {
                                Category: 'fullText',
                                Text: 'name1',
                                Url: 'http://url1?a=1&amp;b=2',
                            },
                            {
                                Category: 'fullText',
                                Text: 'name2',
                                Url: 'http://url2?a=1&amp;b=2&amp;c=3',
                            },
                        ],
                    },
                }),
                [
                    {
                        name: 'name1',
                        url: 'http://url1?a=1&b=2',
                    },
                    {
                        name: 'name2',
                        url: 'http://url2?a=1&b=2&c=3',
                    },
                ],
            );
        });
    });

    describe('extractPdfLinks', function () {
        it('should extract pdf link', function () {
            assert.deepEqual(
                extractor.extractPdfLinks({
                    FullText: {
                        Links: [
                            {
                                Type: 'pdflink',
                                Url: 'http://url1',
                            },
                            {
                                Type: 'pdflink',
                                Url: 'http://url2',
                            },
                        ],
                    },
                }),
                [{ url: 'http://url1' }, { url: 'http://url2' }],
            );
        });

        it('should exclude link with type other than pdflink', function () {
            assert.deepEqual(
                extractor.extractPdfLinks({
                    FullText: {
                        Links: [
                            {
                                Type: 'pdflink',
                                Url: 'http://url1',
                            },
                            {
                                Type: 'nopdflink',
                                Url: 'http://url2',
                            },
                        ],
                    },
                }),
                [{ url: 'http://url1' }],
            );
        });

        it('should exclude link with no Url', function () {
            assert.deepEqual(
                extractor.extractPdfLinks({
                    FullText: {
                        Links: [
                            {
                                Type: 'pdflink',
                                Url: 'http://url1',
                            },
                            { Type: 'nopdflink' },
                        ],
                    },
                }),
                [{ url: 'http://url1' }],
            );
        });
    });

    describe('extractAccessUrls', function () {
        it('should extract URL', function* () {
            assert.deepEqual(
                yield extractor.extractUrls({
                    Items: [
                        {
                            Name: 'URL',
                            Label: 'Availability',
                            Data: 'http://hdl.handle.net/10520/EJC189235',
                        },
                    ],
                }),
                [
                    {
                        name: 'Availability',
                        url: 'http://hdl.handle.net/10520/EJC189235',
                    },
                ],
            );
        });

        it('should extract Avail', function* () {
            assert.deepEqual(
                yield extractor.extractUrls({
                    Items: [
                        {
                            Name: 'Avail',
                            Label: 'Availability',
                            Data: 'http://hdl.handle.net/10520/EJC189235',
                        },
                    ],
                }),
                [
                    {
                        name: 'Availability',
                        url: 'http://hdl.handle.net/10520/EJC189235',
                    },
                ],
            );
        });

        it('should ignore Items with Name other than URL or Avail', function* () {
            assert.deepEqual(
                yield extractor.extractUrls({
                    Items: [
                        {
                            Name: 'not URL',
                            Label: 'A label',
                            Data: 'Some other data',
                        },
                    ],
                }),
                [],
            );
        });

        it('should parse extracted url if necessary', function* () {
            assert.deepEqual(
                yield extractor.extractUrls({
                    Items: [
                        {
                            Name: 'URL',
                            Label: 'Access url',
                            Data: '&lt;link linkTarget=&quot;URL&quot; linkTerm=&quot;https://clinicaltrials.gov/show/NCT01482923&quot; linkWindow=&quot;_blank&quot;&gt;https://clinicaltrials.gov/show/NCT01482923&lt;/link&gt;',
                        },
                    ],
                }),
                [
                    {
                        name: 'Access url',
                        url: 'https://clinicaltrials.gov/show/NCT01482923',
                    },
                ],
            );
        });

        it('should extract url from text if necessary', function* () {
            assert.deepEqual(
                yield extractor.extractUrls({
                    Items: [
                        {
                            Name: 'URL',
                            Label: 'Access url',
                            Data: 'Full Text from ERIC Available online : &lt;link linkTarget=&quot;URL&quot; linkTerm=&quot;https://clinicaltrials.gov/show/NCT01482923&quot; linkWindow=&quot;_blank&quot;&gt;https://clinicaltrials.gov/show/NCT01482923&lt;/link&gt; Bla bla bla',
                        },
                    ],
                }),
                [
                    {
                        name: 'Access url',
                        url: 'https://clinicaltrials.gov/show/NCT01482923',
                    },
                ],
            );
        });

        it('should return emptyArray if no Items', function* () {
            assert.deepEqual(yield extractor.extractUrls({}), []);
        });
    });

    describe('extractHtml', function () {
        it('should extract html from result', function () {
            assert.equal(
                extractor.extractHtml({
                    RecordInfo: {
                        BibRecord: {
                            BibEntity: {
                                Titles: [
                                    {
                                        TitleFull: 'title',
                                        Type: 'main',
                                    },
                                ],
                            },
                        },
                    },
                    FullText: {
                        Text: {
                            Availability: '1',
                            Value: `&lt;anid&gt;anid&lt;/anid&gt;
&lt;title&gt;title&lt;/title&gt;
&lt;hd&gt;subtitle&lt;/hd&gt;
&lt;p&gt;text&lt;/p&gt;
&lt;ulist&gt;
    &lt;item&gt;list item&lt;/item&gt;
&lt;/ulist&gt;`,
                        },
                    },
                }),
                `<html>
    <head>
        <title>title</title>
    </head>
    <body>
        <anid>anid</anid>
<h1>title</h1>
<h2>subtitle</h2>
<p>text</p>
<ul>
    <li>list item</li>
</ul>
    </body>
</html>`,
            );
        });

        it('should return null if no FullText.Text.Value', function () {
            assert.equal(
                extractor.extractHtml({
                    RecordInfo: {
                        BibRecord: {
                            BibEntity: {
                                Titles: [
                                    {
                                        TitleFull: 'title',
                                        Type: 'main',
                                    },
                                ],
                            },
                        },
                    },
                    FullText: {
                        Text: {
                            Availability: '1',
                        },
                    },
                }),
                null,
            );
        });

        it('should return null if FullText.Text.Availability is not 1', function () {
            assert.equal(
                extractor.extractHtml({
                    RecordInfo: {
                        BibRecord: {
                            BibEntity: {
                                Titles: [
                                    {
                                        TitleFull: 'title',
                                        Type: 'main',
                                    },
                                ],
                            },
                        },
                    },
                    FullText: {
                        Text: {
                            Availability: '0',
                            Value: `&lt;anid&gt;anid&lt;/anid&gt;
&lt;title&gt;title&lt;/title&gt;
&lt;hd&gt;subtitle&lt;/hd&gt;
&lt;p&gt;text&lt;/p&gt;
&lt;ulist&gt;
    &lt;item&gt;list item&lt;/item&gt;
&lt;/ulist&gt;`,
                        },
                    },
                }),
                null,
            );
        });

        it('should return null if no FullText.Text', function () {
            assert.equal(
                extractor.extractHtml({
                    RecordInfo: {
                        BibRecord: {
                            BibEntity: {
                                Titles: [
                                    {
                                        TitleFull: 'title',
                                        Type: 'main',
                                    },
                                ],
                            },
                        },
                    },
                    FullText: {},
                }),
                null,
            );
        });

        it('should return null if no FullText', function () {
            assert.equal(
                extractor.extractHtml({
                    RecordInfo: {
                        BibRecord: {
                            BibEntity: {
                                Titles: [
                                    {
                                        TitleFull: 'title',
                                        Type: 'main',
                                    },
                                ],
                            },
                        },
                    },
                }),
                null,
            );
        });
    });

    describe('cleanUrl', function () {
        it('should return url from given string', function () {
            assert.equal(
                extractor.cleanUrl(
                    'http://editor.com?title=the title&author=nemo',
                ),
                'http://editor.com?title=the title&author=nemo',
            );
            assert.equal(
                extractor.cleanUrl(
                    'series: http://onlinelibrary.wiley.com/journal/10.1002/%28ISSN%291944-8007/issues',
                ),
                'http://onlinelibrary.wiley.com/journal/10.1002/%28ISSN%291944-8007/issues',
            );
        });
    });
});
