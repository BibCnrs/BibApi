import ebscoRequest from './ebscoRequest';

export default function* ebscoPublicationRetrieve(id, authToken, sessionToken) {
    return yield ebscoRequest(
        '/edsapi/publication/Retrieve',
        {
            HighlightTerms: null,
            Id: id,
        },
        sessionToken,
        authToken,
    );
}
