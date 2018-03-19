import ebscoPublicationSearch from './ebscoPublicationSearch';
import retry from '../utils/retry';

export function* pureSearchPublication(query, domain, ebscoToken) {
    const { user_id, password, profile } = domain;
    const { authToken, sessionToken } = yield ebscoToken.get(
        domain.name,
        user_id,
        password,
        profile,
    );

    try {
        const result = yield ebscoPublicationSearch(
            query,
            sessionToken,
            authToken,
        );

        return result;
    } catch (error) {
        yield ebscoToken.invalidateSession(domain.name);
        throw error;
    }
}

export default retry(pureSearchPublication, 5);
