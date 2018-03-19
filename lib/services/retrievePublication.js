import ebscoPublicationRetrieve from './ebscoPublicationRetrieve';
import ebscoConnexion from './ebscoConnexion';

export const pureRetrievePublication = (sessionToken, authToken) =>
    function* pureRetrievePublication(id) {
        const result = yield ebscoPublicationRetrieve(
            id,
            sessionToken,
            authToken,
        );
        return result.Record;
    };

export default ebscoConnexion(pureRetrievePublication);
