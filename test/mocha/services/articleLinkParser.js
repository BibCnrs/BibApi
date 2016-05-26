import articleLinkParser from '../../../lib/services/articleLinkParser';

describe('articleLinkParser', function () {

    it('should extract link from record.FullText.Links when available', function* () {
        assert.deepEqual(yield articleLinkParser({
            FullText: {
                Links: [
                    { Url: 'link1' },
                    { Url: 'link2' }
                ]
            }
        }), ['link1', 'link2']);
    });

    it('should extract link from Avail Items when no FullText.Links', function* () {
        assert.deepEqual(yield articleLinkParser({
            Items: [
                {
                    Name: 'Avail',
                    Data: 'Full Text from ERIC Available online: &lt;externalLink term=&quot;http:\/\/www.eric.ed.gov\/contentdelivery\/servlet\/ERICServlet?accno=EJ1051131&quot;&gt;http:\/\/www.eric.ed.gov\/contentdelivery\/servlet\/ERICServlet?accno=EJ1051131&lt;\/externalLink&gt;&lt;br \/&gt;Clute Institute. 6901 South Pierce Street Suite 239, Littleton, CO 80128. Tel: 303-904-4750; Fax: 303-978-0413; e-mail: Staff@CluteInstitute.com; Web site: http:\/\/www.cluteinstitute.com'
                }
            ]
        }), ['http:\/\/www.eric.ed.gov\/contentdelivery\/servlet\/ERICServlet?accno=EJ1051131']);
    });

    it('should return empty array if no link present in Items Avail', function* () {
        assert.deepEqual(yield articleLinkParser({
            Items: [
                {
                    Name: 'Avail',
                    Data: 'Full Text from ERIC Available online: &lt;br \/&gt;Clute Institute. 6901 South Pierce Street Suite 239, Littleton, CO 80128. Tel: 303-904-4750; Fax: 303-978-0413; e-mail: Staff@CluteInstitute.com; Web site: http:\/\/www.cluteinstitute.com'
                }
            ]
        }), []);
    });

    it('should returen empty array if Avail in Items', function* () {
        assert.deepEqual(yield articleLinkParser({
            Items: [
                {
                    Name: 'name',
                    Data: 'ignored value'
                }
            ]
        }), []);
    });

    it('should return empty array if no FullText nor Items', function* () {
        assert.deepEqual(yield articleLinkParser({}), []);
    });

});
