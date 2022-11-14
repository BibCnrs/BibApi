import cleanXml from '../../../lib/utils/cleanXml';

describe('cleanXml', function () {
    it('should replace <br/> par \\n', function () {
        assert.equal(cleanXml('line<br/>otherline'), 'line\notherline');
        assert.equal(cleanXml('line<br>otherline'), 'line\notherline');
        assert.equal(cleanXml('line<br />otherline'), 'line\notherline');
        assert.equal(cleanXml('line<br >otherline'), 'line\notherline');
    });

    it('should replace &lt;br/&gt; par \\n', function () {
        assert.equal(cleanXml('line&lt;br&gt;otherline'), 'line\notherline');
        assert.equal(cleanXml('line&lt;br/&gt;otherline'), 'line\notherline');
        assert.equal(cleanXml('line&lt;br /&gt;otherline'), 'line\notherline');
        assert.equal(cleanXml('line&lt;br &gt;otherline'), 'line\notherline');
    });

    it('should remove all tag', function () {
        assert.equal(
            cleanXml('text, <randomTag>other text</randomTag>, some more text'),
            'text, other text, some more text',
        );
        assert.equal(
            cleanXml(
                'text, <randomTag >other text</ randomTag>, some more text',
            ),
            'text, other text, some more text',
        );
        assert.equal(
            cleanXml(
                'text, <randomTag attr="whatever">other text</randomTag>, some more text',
            ),
            'text, other text, some more text',
        );
    });

    it('should remove all encoded tag', function () {
        assert.equal(
            cleanXml(
                'text, &lt;randomTag&gt;other text&lt;/randomTag&gt;, some more text',
            ),
            'text, other text, some more text',
        );
        assert.equal(
            cleanXml(
                'text, &lt;randomTag &gt;other text&lt;/ randomTag&gt;, some more text',
            ),
            'text, other text, some more text',
        );
        assert.equal(
            cleanXml(
                'text, &lt;randomTag attr="whatever"&gt;other text&lt;/randomTag&gt;, some more text',
            ),
            'text, other text, some more text',
        );
    });
});
