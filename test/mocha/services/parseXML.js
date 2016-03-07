import parseXML, { extractSearchLink, extractIndice, extractFirstValue, extractLastValue, parseXMLLine } from '../../../lib/services/parseXML';

describe('parseXML', function () {
    it('should extract searchLink', function () {
        const authorField = '&lt;searchLink fieldCode=&quot;AU&quot; term=&quot;%22Chen+S%22&quot;&gt;Chen S&lt;/searchLink&gt;; Hebei Province Center for Disease Control and Prevention, 97 Huaian East Road, Yuhua District, Shijiazhuang, 050021, China. hebeicdc2013@sina.com.&lt;br /&gt;&lt;searchLink fieldCode=&quot;AU&quot; term=&quot;%22Zhao+H%22&quot;&gt;Zhao H&lt;/searchLink&gt;; Hebei Province Center for Disease Control and Prevention, 97 Huaian East Road, Yuhua District, Shijiazhuang, 050021, China. sunline6666@sina.com.&lt;br /&gt;&lt;searchLink fieldCode=&quot;AU&quot; term=&quot;%22Zhao+C%22&quot;&gt;Zhao C&lt;/searchLink&gt;; Hebei Province Center for Disease Control and Prevention, 97 Huaian East Road, Yuhua District, Shijiazhuang, 050021, China. zhaocuiying906@sina.com.';

        assert.deepEqual(parseXML(authorField), [
            {
                field: 'AU',
                indice: null,
                term: 'Chen S',
                firstValue: '',
                lastValue: 'Hebei Province Center for Disease Control and Prevention, 97 Huaian East Road, Yuhua District, Shijiazhuang, 050021, China. hebeicdc2013@sina.com.'
            },
            {
                field: 'AU',
                indice: null,
                term: 'Zhao H',
                firstValue: '',
                lastValue: 'Hebei Province Center for Disease Control and Prevention, 97 Huaian East Road, Yuhua District, Shijiazhuang, 050021, China. sunline6666@sina.com.'
            },
            {
                field: 'AU',
                indice: null,
                term: 'Zhao C',
                firstValue: '',
                lastValue: 'Hebei Province Center for Disease Control and Prevention, 97 Huaian East Road, Yuhua District, Shijiazhuang, 050021, China. zhaocuiying906@sina.com.'
            }
        ]);
    });

    describe('extractSearchLink', function () {
        it('should return searchLink tag child as term and fieldCode property as field', function () {
            assert.deepEqual(extractSearchLink('<searchLink fieldCode="AU">hello</searchLink>'), { term: 'hello', field: 'AU' });
        });

        it('should return null if there is no searchLink tag', function () {
            assert.isNull(extractSearchLink('<notsearchLink fieldCode="AU">hello</notsearchLink>'));
        });
    });

    describe('extractIndice', function () {
        it('should return RelatesTo tag child', function () {
            assert.equal(extractIndice('<relatesTo attr="yes">hello</relatesTo>'), 'hello');
        });

        it('should return null if there is no searchLink tag', function () {
            assert.isNull(extractSearchLink('<notsearchLink fieldCode="AU">hello</notsearchLink>'));
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

    describe('parseXMLLine', function () {
        it('should return object with value extracted from string', function() {
            assert.deepEqual(parseXMLLine(' first value <searchLink fieldCode="field">term</searchLink><relatesTo>indice</relatesTo> last value '), {
                term: 'term',
                field: 'field',
                indice: 'indice',
                firstValue: 'first value',
                lastValue: 'last value'
            });
        });

        it('should return lastValue extracted from string if there is no searchLink tag', function() {
            assert.deepEqual(parseXMLLine('<relatesTo>indice</relatesTo> value '), 'value');
        });
    });
});
