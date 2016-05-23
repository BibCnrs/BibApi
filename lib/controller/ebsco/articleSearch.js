import ebscoArticleSearch from '../../services/ebscoArticleSearch';
import searchArticleParser from '../../services/searchArticleParser';

export const articleSearch = function* articleSearch(domainName) {
    const { user_id, password, profile } = this.domain;
    const authToken = yield this.getAuthenticationToken(domainName, user_id, password);
    const sessionToken = yield this.getSessionToken(domainName, profile, authToken);
    if (!sessionToken) {
        this.status = 401;
        return;
    }
    this.query.queries = JSON.parse(decodeURIComponent(this.query.queries));
    this.query.activeFacets = this.query.activeFacets && JSON.parse(decodeURIComponent(this.query.activeFacets));
    const result = yield ebscoArticleSearch(this.query, sessionToken, authToken);

    this.body = searchArticleParser(result);
};

export const articleSearchPure = function* articleSearchPure(domainName) {
    const { user_id, password, profile } = this.domain;
    const authToken = yield this.getAuthenticationToken(domainName, user_id, password);
    const sessionToken = yield this.getSessionToken(domainName, profile, authToken);
    if (!sessionToken) {
        this.status = 401;
        return;
    }

    this.query.queries = JSON.parse(decodeURIComponent(this.query.queries));
    this.query.activeFacets = this.query.activeFacets && JSON.parse(decodeURIComponent(this.query.activeFacets));
    this.body = yield ebscoArticleSearch(this.query, sessionToken, authToken);
};
