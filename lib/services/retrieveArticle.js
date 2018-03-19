import ebscoEdsRetrieve from './ebscoEdsRetrieve';
import retry from '../utils/retry';

export function* pureRetrieveArticle(domainName, domain, dbId, an, ebscoToken) {
    const { user_id, password, profile } = domain;
    const { authToken, sessionToken } = yield ebscoToken.get(
        domainName,
        user_id,
        password,
        profile,
    );
    try {
        const result = yield ebscoEdsRetrieve(
            dbId,
            an,
            sessionToken,
            authToken,
        );

        return result.Record;
    } catch (error) {
        yield ebscoToken.invalidateSession(domainName);
        throw error;
    }
}

export default retry(pureRetrieveArticle, 5);
