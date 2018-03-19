import ebscoPublicationSearch from './ebscoPublicationSearch';
import ebscoConnexion from './ebscoConnexion';

export const pureSearchPublication = (sessionToken, authToken) =>
    function* pureSearchPublication(query) {
        return yield ebscoPublicationSearch(query, sessionToken, authToken);
    };

export default ebscoConnexion(pureSearchPublication);
