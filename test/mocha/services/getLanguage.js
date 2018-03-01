import getLanguage from '../../../lib/services/getLanguage';

describe('getLanguage', () => {
    it('should extract language from headers', () => {
        assert.equal(getLanguage({ 'accept-language': 'en-US' }), 'en');
        assert.equal(getLanguage({ 'accept-language': 'fr-CA' }), 'fr');
    });
    it('should return en if not fr nor en', () => {
        assert.equal(getLanguage({ 'accept-language': 'de-DE' }), 'en');
    });
    it('should default to en if no header', () => {
        assert.equal(getLanguage({ 'accept-language': 'en-US' }), 'en');
    });
});
