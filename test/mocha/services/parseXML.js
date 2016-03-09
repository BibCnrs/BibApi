import parseXML, { extractSearchLink, extractIndice,  extractFirstValue, extractLastValue, parseXMLLine,  parseLabelValue } from '../../../lib/services/parseXML';

describe('parseXML', function () {
    it('should extract searchLink', function () {
        const authorField = '&lt;searchLink fieldCode=&quot;AU&quot; term=&quot;%22Chen+S%22&quot;&gt;Chen S&lt;/searchLink&gt;; Hebei Province Center for Disease Control and Prevention, 97 Huaian East Road, Yuhua District, Shijiazhuang, 050021, China. hebeicdc2013@sina.com.&lt;br /&gt;&lt;searchLink fieldCode=&quot;AU&quot; term=&quot;%22Zhao+H%22&quot;&gt;Zhao H&lt;/searchLink&gt;; Hebei Province Center for Disease Control and Prevention, 97 Huaian East Road, Yuhua District, Shijiazhuang, 050021, China. sunline6666@sina.com.&lt;br /&gt;&lt;searchLink fieldCode=&quot;AU&quot; term=&quot;%22Zhao+C%22&quot;&gt;Zhao C&lt;/searchLink&gt;; Hebei Province Center for Disease Control and Prevention, 97 Huaian East Road, Yuhua District, Shijiazhuang, 050021, China. zhaocuiying906@sina.com.';

        assert.deepEqual(parseXML(authorField), [
            {
                searchable: [{
                    field: 'AU',
                    indice: undefined,
                    term: '"Chen S"',
                    value: 'Chen S'
                }],
                firstValue: '',
                lastValue: 'Hebei Province Center for Disease Control and Prevention, 97 Huaian East Road, Yuhua District, Shijiazhuang, 050021, China. hebeicdc2013@sina.com.'
            },
            {
                searchable: [{
                    field: 'AU',
                    indice: undefined,
                    term: '"Zhao H"',
                    value: 'Zhao H'
                }],
                firstValue: '',
                lastValue: 'Hebei Province Center for Disease Control and Prevention, 97 Huaian East Road, Yuhua District, Shijiazhuang, 050021, China. sunline6666@sina.com.'
            },
            {
                searchable: [{
                    field: 'AU',
                    indice: undefined,
                    term: '"Zhao C"',
                    value: 'Zhao C'
                }],
                firstValue: '',
                lastValue: 'Hebei Province Center for Disease Control and Prevention, 97 Huaian East Road, Yuhua District, Shijiazhuang, 050021, China. zhaocuiying906@sina.com.'
            }
        ]);
    });

    describe('extractSearchLink', function () {
        it('should return searchLink tag child as term and fieldCode property as field', function () {
            assert.deepEqual(extractSearchLink('<searchLink fieldCode="AU" term="hello" >hello</searchLink><relatesTo>19</relatesTo>'), [
                { term: 'hello', value: 'hello', field: 'AU', indice: '19' }
            ]);
            assert.deepEqual(extractSearchLink('<searchLink fieldCode="AU" term="hello" >hello</searchLink><superscript>7</superscript>'), [
                { term: 'hello', value: 'hello', field: 'AU', indice: '7' }
            ]);
        });

        it('should return all searchLink if several ones', function () {
            const value = '<searchLink fieldCode="MM" term="%22Disease+Outbreaks%22">Disease Outbreaks*</searchLink><relatesTo>5</relatesTo>/<searchLink fieldCode="MM" term="%22Disease+Outbreaks+prevention+%26+control%22">prevention & control</searchLink>';
            assert.deepEqual(extractSearchLink(value), [
                { term: '"Disease Outbreaks"', value: 'Disease Outbreaks*', field: 'MM', indice: '5' },
                { term: '"Disease Outbreaks prevention & control"', value: 'prevention & control', field: 'MM', indice: undefined }
            ]);
        });

        it('should return emptyArray if there is no searchLink tag', function () {
            assert.deepEqual(extractSearchLink('<notsearchLink fieldCode="AU">hello</notsearchLink>'), []);
        });
    });

    describe('extractIndice', function () {
        it('should return RelatesTo tag child', function () {
            assert.equal(extractIndice('<relatesTo attr="yes">hello</relatesTo>'), 'hello');
        });

        it('should return superscript tag child', function () {
            assert.equal(extractIndice('<superscript attr="yes">hello</superscript>'), 'hello');
        });

        it('should return null if there is no RelatesTo tag', function () {
            assert.isNull(extractIndice('<notRelatesTo>hello</notRelatesTo>'));
        });
    });

    describe('extractLastValue', function () {
        it('should return trimed string after last tag', function () {
            assert.equal(extractLastValue('ah<searchLink fieldCode="AU">ouh</searchLink>oh<relatesTo attr="yes">oups</relatesTo> ; hello  '), 'hello');
        });

        it('should return trimed value if no tag', function () {
            assert.equal(extractLastValue(' ; hello  '), 'hello');
        });

        it('should return empty string if no content after last tag', function () {
            assert.equal(extractLastValue('ah<searchLink fieldCode="AU">ouh</searchLink>oh<relatesTo attr="yes">oups</relatesTo>'), '');
        });
    });

    describe('extractFirstValue', function () {
        it('should return trimed string before first tag', function () {
            assert.equal(extractFirstValue('  ah ;<searchLink fieldCode="AU">ouh</searchLink>oh<relatesTo attr="yes">oups</relatesTo> ; hello  '), 'ah');
        });

        it('should return trimed value if no tag', function () {
            assert.equal(extractFirstValue(' ; hello  '), 'hello');
        });

        it('should return empty string if no content before first tag', function () {
            assert.equal(extractFirstValue('<searchLink fieldCode="AU">ouh</searchLink>oh<relatesTo attr="yes">oups</relatesTo> ; hello '), '');
        });
    });

    describe('parseLabelValue', function () {
        it('should convert <i>to label and following string to value', function () {
            assert.deepEqual(parseLabelValue('<i>label</i>value'), {
                'label': 'value'
            });
        });

        it('should work with several <i>', function () {
            assert.deepEqual(parseLabelValue('<i>label1</i>value1<i>label2</ i>value2<i>label3</i>value3'), {
                label1: 'value1',
                label2: 'value2',
                label3: 'value3'
            });
        });

        it('should work parse searchLinkValue too', function () {
            assert.deepEqual(parseLabelValue('<i>label</i><searchLink fieldCode="TI" term="search me">search</searchLink>'), {
                label: {
                    firstValue: '',
                    lastValue: '',
                    searchable: [{
                        field: 'TI',
                        value: 'search',
                        term: 'search me',
                        indice: undefined
                    }]
                }
            });
        });
    });

    describe('parseXMLLine', function () {
        it('should return object with value extracted from string', function() {
            assert.deepEqual(parseXMLLine(' first value <searchLink fieldCode="field" term="term">searchable value</searchLink><relatesTo>indice</relatesTo> last value '), {
                searchable: [{
                    term: 'term',
                    field: 'field',
                    value: 'searchable value',
                    indice: 'indice'
                }],
                firstValue: 'first value',
                lastValue: 'last value'
            });
        });

        it('should return lastValue extracted from string if there is no searchLink tag', function() {
            assert.deepEqual(parseXMLLine(' value '), 'value');
        });

        it('should return lastValue and indice extracted from string if there is no searchLink tag but one relatesTo tag', function() {
            assert.deepEqual(parseXMLLine('<relatesTo>indice</relatesTo> value '), {
                lastValue: 'value',
                indice: 'indice'
            });
        });

        it('should use parseLabelValue if it start with <i>', function () {
            assert.deepEqual(parseXMLLine('<i>label</i>value'), {
                label: 'value'
            });
        });
    });

});
