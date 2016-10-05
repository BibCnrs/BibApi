import ebscoArticleSearch from './ebscoArticleSearch';
import searchArticleParser from './searchArticleParser';

export default function* searchArticle(domainName, domain, query, ebscoToken) {
    const { user_id, password, profile } = domain;
    const { authToken, sessionToken } = yield ebscoToken.get(domainName, user_id, password, profile);

    try {
        const result = yield ebscoArticleSearch(query, sessionToken, authToken);
        return yield searchArticleParser(result);
    } catch (error) {
        yield ebscoToken.invalidate(domainName);
        throw error;
    }
}
