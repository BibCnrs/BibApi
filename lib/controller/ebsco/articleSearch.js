import ebscoArticleSearch from '../../services/ebscoArticleSearch';
import retry from '../../utils/retry';
import searchArticle from '../../services/searchArticle';

export const articleSearch = function* articleSearch(domainName) {
    this.body = yield retry(searchArticle, [domainName, this.domain, this.query, this.ebscoToken], 5);
};

export const articleSearchPure = function* articleSearchPure(domainName) {
    const { user_id, password, profile } = this.domain;
    const { authToken, sessionToken } = yield this.ebscoToken.get(domainName, user_id, password, profile);
    if (!sessionToken) {
        this.status = 401;
        return;
    }
    this.query.queries = JSON.parse(decodeURIComponent(this.query.queries));
    this.query.activeFacets = this.query.activeFacets && JSON.parse(decodeURIComponent(this.query.activeFacets));
    try {
        this.body = yield ebscoArticleSearch(this.query, sessionToken, authToken);
    } catch (error) {
        yield this.ebscoToken.invalidate(domainName);
        throw error;
    }
};
