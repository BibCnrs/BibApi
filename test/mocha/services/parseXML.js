import parseXML, { extractSearchLink, extractIndice, extractValue, parseXMLLine } from '../../../lib/services/parseXML';

describe('parseXML', function () {
    it('should extract searchLink', function () {
        const authorField = '&lt;searchLink fieldCode=&quot;AU&quot; term=&quot;%22Chen+S%22&quot;&gt;Chen S&lt;/searchLink&gt;; Hebei Province Center for Disease Control and Prevention, 97 Huaian East Road, Yuhua District, Shijiazhuang, 050021, China. hebeicdc2013@sina.com.&lt;br /&gt;&lt;searchLink fieldCode=&quot;AU&quot; term=&quot;%22Zhao+H%22&quot;&gt;Zhao H&lt;/searchLink&gt;; Hebei Province Center for Disease Control and Prevention, 97 Huaian East Road, Yuhua District, Shijiazhuang, 050021, China. sunline6666@sina.com.&lt;br /&gt;&lt;searchLink fieldCode=&quot;AU&quot; term=&quot;%22Zhao+C%22&quot;&gt;Zhao C&lt;/searchLink&gt;; Hebei Province Center for Disease Control and Prevention, 97 Huaian East Road, Yuhua District, Shijiazhuang, 050021, China. zhaocuiying906@sina.com.';

        assert.deepEqual(parseXML(authorField), [
            {
                field: 'AU',
                indice: null,
                term: 'Chen S',
                value: 'Hebei Province Center for Disease Control and Prevention, 97 Huaian East Road, Yuhua District, Shijiazhuang, 050021, China. hebeicdc2013@sina.com.'
            },
            {
                field: 'AU',
                indice: null,
                term: 'Zhao H',
                value: 'Hebei Province Center for Disease Control and Prevention, 97 Huaian East Road, Yuhua District, Shijiazhuang, 050021, China. sunline6666@sina.com.'
            },
            {
                field: 'AU',
                indice: null,
                term: 'Zhao C',
                value: 'Hebei Province Center for Disease Control and Prevention, 97 Huaian East Road, Yuhua District, Shijiazhuang, 050021, China. zhaocuiying906@sina.com.'
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

    describe('extractValue', function () {
        it('should return trimed string after last tag', function () {
            assert.equal(extractValue('ah<searchLink fieldCode="AU">ouh</searchLink>oh<relatesTo attr="yes">oups</relatesTo> ; hello  '), 'hello');
        });

        it('should return trimed value if no tag', function () {
            assert.equal(extractValue(' ; hello  '), 'hello');
        });

        it('should return empty string if no content after last tag', function () {
            assert.equal(extractValue('ah<searchLink fieldCode="AU">ouh</searchLink>oh<relatesTo attr="yes">oups</relatesTo>'), '');
        });
    });

    describe('parseXMLLine', function () {
        it('should return object with value extracted from string', function() {
            assert.deepEqual(parseXMLLine('<searchLink fieldCode="field">term</searchLink><relatesTo>indice</relatesTo> value '), {
                term: 'term',
                field: 'field',
                indice: 'indice',
                value: 'value'
            });
        });

        it('should return value extracted from string if there is no searchLink tag', function() {
            assert.deepEqual(parseXMLLine('<relatesTo>indice</relatesTo> value '), 'value');
        });
    });
});
