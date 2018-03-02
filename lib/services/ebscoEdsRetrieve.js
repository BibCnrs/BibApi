import ebscoRequest from './ebscoRequest';

export default function* search(dbId, an, authToken, sessionToken) {
    return yield ebscoRequest(
        '/edsapi/rest/Retrieve',
        {
            EbookPreferredFormat: 'ebook-pdf',
            HighlightTerms: null,
            An: an,
            DbId: dbId,
        },
        sessionToken,
        authToken,
    );
}
