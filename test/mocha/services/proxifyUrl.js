import proxifyUrl from '../../../lib/services/proxifyUrl';

describe('proxifyUrl', () => {
    it('should proxify given url with gate', () => {
        assert.equal(
            proxifyUrl('gate', 'url'),
            'http://gate.bib.cnrs.fr/login?url=url',
        );
    });

    it('should skip url if none given', () => {
        assert.equal(proxifyUrl('gate'), 'http://gate.bib.cnrs.fr/login?url=');
    });

    it('should replace `.` by `-` for https url', () => {
        assert.equal(
            proxifyUrl('gate', 'https://url.test.com'),
            'http://gate.bib.cnrs.fr/login?url=https://url-test-com',
        );
    });

    it('should not touch `.` in query parameter', () => {
        assert.equal(
            proxifyUrl(
                'gate',
                'https://url.test.com?setting.name=test&setting.value=ok',
            ),
            'http://gate.bib.cnrs.fr/login?url=https://url-test-com?setting.name=test&setting.value=ok',
        );
    });
});
