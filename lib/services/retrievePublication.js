import ebscoPublicationRetrieve from './ebscoPublicationRetrieve';
import retry from '../utils/retry';

export function* pureRetrievePublication(domainName, id, domain, ebscoToken) {
    const { user_id, password, profile } = domain;
    const { authToken, sessionToken } = yield ebscoToken.get(
        domainName,
        user_id,
        password,
        profile,
    );
    try {
        const result = yield ebscoPublicationRetrieve(
            id,
            sessionToken,
            authToken,
        );
        return result.Record;
    } catch (error) {
        yield ebscoToken.invalidateSession(domainName);
        throw error;
    }
}

export default retry(pureRetrievePublication, 5);
