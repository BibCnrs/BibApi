import parseXML, {  parseXMLLine,  parseXMLObject, smartConcat } from '../../../lib/services/parseXML';

describe('parseXML', function () {
    it('should extract searchLink', function* () {
        const authorField = '&lt;searchLink fieldCode=&quot;AU&quot; term=&quot;%22Chen+S%22&quot;&gt;Chen S&lt;/searchLink&gt;; Hebei Province Center for Disease Control and Prevention, 97 Huaian East Road, Yuhua District, Shijiazhuang, 050021, China. hebeicdc2013@sina.com.&lt;br /&gt;&lt;searchLink fieldCode=&quot;AU&quot; term=&quot;%22Zhao+H%22&quot;&gt;Zhao H&lt;/searchLink&gt;; Hebei Province Center for Disease Control and Prevention, 97 Huaian East Road, Yuhua District, Shijiazhuang, 050021, China. sunline6666@sina.com.&lt;br /&gt;&lt;searchLink fieldCode=&quot;AU&quot; term=&quot;%22Zhao+C%22&quot;&gt;Zhao C&lt;/searchLink&gt;; Hebei Province Center for Disease Control and Prevention, 97 Huaian East Road, Yuhua District, Shijiazhuang, 050021, China. zhaocuiying906@sina.com.';

        assert.deepEqual(yield parseXML(authorField), [
            [
                {
                    field: 'AU',
                    term: '"Chen S"',
                    value: 'Chen S'
                },
                'Hebei Province Center for Disease Control and Prevention, 97 Huaian East Road, Yuhua District, Shijiazhuang, 050021, China. hebeicdc2013@sina.com.'
            ],
            [
                {
                    field: 'AU',
                    term: '"Zhao H"',
                    value: 'Zhao H'
                },
                'Hebei Province Center for Disease Control and Prevention, 97 Huaian East Road, Yuhua District, Shijiazhuang, 050021, China. sunline6666@sina.com.'
            ],
            [
                {
                    field: 'AU',
                    term: '"Zhao C"',
                    value: 'Zhao C'
                },
                'Hebei Province Center for Disease Control and Prevention, 97 Huaian East Road, Yuhua District, Shijiazhuang, 050021, China. zhaocuiying906@sina.com.'
            ]
        ]);
    });

    describe('parseXMLObject', function () {
        it('should return value if it is a string', function () {
            assert.equal(parseXMLObject('hello'), 'hello');
        });

        it('should return $attrs.term, $attrs.fieldcode as field and $test as value if $name is "searchlink"', function () {
            assert.deepEqual(parseXMLObject({
                $name: 'searchlink',
                $text: 'search label',
                $attrs: {
                    term: 'search term',
                    fieldcode: 'field code'
                }
            }), {
                value: 'search label',
                term: 'search term',
                field: 'field code'
            });
        });

        it('should return {indice: $text} if $name is relatesto', function () {
            assert.deepEqual(parseXMLObject({
                $name: 'relatesto',
                $text: 'indice value'
            }), {
                indice: 'indice value'
            });
        });

        it('should return $text if $name is i', function () {
            assert.deepEqual(parseXMLObject({
                $name: 'i',
                $text: 'tag value'
            }), 'tag value');
        });

        it('should return $attrs.term, $attrs.fieldcode as field and $test as value if $name is "externallink"', function () {
            assert.deepEqual(parseXMLObject({
                $name: 'externallink',
                $text: 'link label',
                $attrs: {
                    term: 'link url'
                }
            }), {
                value: 'link label',
                url: 'link url'
            });
        });

        it('should return $attrs.term, $attrs.fieldcode as field and $test as value if $name is "link"', function () {
            assert.deepEqual(parseXMLObject({
                $name: 'link',
                $text: 'link label',
                $attrs: {
                    linkterm: 'link url'
                }
            }), {
                value: 'link label',
                url: 'link url'
            });
        });

        it('should parse inline-formula', () => {
            assert.deepEqual(parseXMLObject({
                $name: 'inline-formula',
                'tex-math': {
                    $attrs: {
                        notation: 'LaTeX'
                    },
                    $text: '$(1,s)$'
                }
            }), {
                notation: 'LaTeX',
                value: '(1,s)',
            });
        });
    });

    describe('smartConcat', function () {
        it('should add value to array', function () {
            assert.deepEqual(smartConcat([{ item: 1}], 'new value'), [{ item: 1}, 'new value']);
        });

        it('should not add value to array if it is falsy', function () {
            assert.deepEqual(smartConcat([{ item: 1}], null), [{ item: 1}]);
            assert.deepEqual(smartConcat([{ item: 1}], undefined), [{ item: 1}]);
            assert.deepEqual(smartConcat([{ item: 1}], ''), [{ item: 1}]);
            assert.deepEqual(smartConcat([{ item: 1}], 0), [{ item: 1}]);
        });

        it('should join value with array last item if both are string', function () {
            assert.deepEqual(smartConcat([{ item: 1}, 'join'], 'us'), [{ item: 1}, 'join us']);
        });
    });

    describe('parseXMLLine', function () {
        it('should return object with value extracted from string', function* () {
            assert.deepEqual(
                yield parseXMLLine(' first value <searchLink fieldCode="field" term="term">searchable value</searchLink><relatesTo>indice</relatesTo> last value '),
                [
                    'first value',
                    {
                        term: 'term',
                        field: 'field',
                        value: 'searchable value'
                    },
                    {
                        indice: 'indice'
                    },
                    'last value'
                ]
            );
        });

        it('should return object with value extracted from string when there is only tag', function* () {
            assert.deepEqual(
                yield parseXMLLine('<searchLink fieldCode="AR" term="%22Bhat%2C+Nisha%22">Bhat, Nisha</searchLink><relatesTo>1</relatesTo>'),
                [
                    {
                        term: '"Bhat, Nisha"',
                        field: 'AR',
                        value: 'Bhat, Nisha'
                    },
                    {
                        indice: '1'
                    }
                ]
            );
        });

        it('should return passed value if there is no tag', function* () {
            assert.deepEqual(yield parseXMLLine(' value '), 'value');
        });

        it('should return lastValue and indice extracted from string if there is no searchLink tag but one relatesTo tag', function* () {
            assert.deepEqual(yield parseXMLLine('<relatesTo>indice</relatesTo> after'), [
                {
                    indice: 'indice'
                },
                'after'
            ]);
        });

        it('should use parseLabelValue if it start with <i>', function* () {
            assert.deepEqual(yield parseXMLLine('<i>label</i>value'), ['label value']);
        });

        it('should return given line if parseXMLLine cannot parse xml', function* () {
            assert.deepEqual(yield parseXMLLine('<relatesTo>indice</relatesTo> after </10 value'), '<relatesTo>indice</relatesTo> after </10 value');
        });

    });

});
