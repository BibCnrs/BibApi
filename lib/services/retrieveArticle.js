import retrieveArticleParser from './retrieveArticleParser';
import ebscoEdsRetrieve from './ebscoEdsRetrieve';

export default function* retrieveArticle(
    domainName,
    domain,
    dbId,
    an,
    ebscoToken,
) {
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

        return yield retrieveArticleParser(result.Record);
    } catch (error) {
        yield ebscoToken.invalidateSession(domainName);
        throw error;
    }
}
