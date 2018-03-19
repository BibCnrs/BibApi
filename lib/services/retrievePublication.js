import ebscoPublicationRetrieve from './ebscoPublicationRetrieve';
import retry from '../utils/retry';

export function* pureRetrievePublication(id, domain, ebscoToken) {
    const { user_id, password, profile } = domain;
    const { authToken, sessionToken } = yield ebscoToken.get(
        domain.name,
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
        yield ebscoToken.invalidateSession(domain.name);
        throw error;
    }
}

export default retry(pureRetrievePublication, 5);
