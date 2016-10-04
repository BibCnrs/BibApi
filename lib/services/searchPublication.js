import ebscoPublicationSearch from './ebscoPublicationSearch';
import searchPublicationParser from './searchPublicationParser';

export default function* searchPublication(domainName, query, domain, ebscoToken) {
    const { user_id, password, profile } = domain;
    const { authToken, sessionToken} = yield ebscoToken.get(domainName, user_id, password, profile);

    try {
        const result = yield ebscoPublicationSearch(query, sessionToken, authToken);

        return searchPublicationParser(result);
    } catch (error) {
        yield ebscoToken.invalidate(domainName);
        throw error;
    }
}
