import ebscoPublicationSearch from '../../services/ebscoPublicationSearch';
import searchPublicationParser from '../../services/searchPublicationParser';

export const publicationSearch = function* publicationSearch(domainName) {
    const { user_id, password, profile } = this.domain;
    const authToken = yield this.getAuthenticationToken(domainName, user_id, password);
    const sessionToken = yield this.getSessionToken(domainName, profile, authToken);
    if (!sessionToken) {
        this.status = 401;
        return;
    }
    this.query.queries = JSON.parse(decodeURIComponent(this.query.queries));
    this.query.activeFacets = this.query.activeFacets && JSON.parse(decodeURIComponent(this.query.activeFacets));
    const result = yield ebscoPublicationSearch(this.query, sessionToken, authToken);

    this.body = searchPublicationParser(result);
};

export const publicationSearchPure = function* publicationSearchPure(domainName) {
    const { user_id, password, profile } = this.domain;
    const authToken = yield this.getAuthenticationToken(domainName, user_id, password);
    const sessionToken = yield this.getSessionToken(domainName, profile, authToken);
    if (!sessionToken) {
        this.status = 401;
        return;
    }

    this.query.queries = JSON.parse(decodeURIComponent(this.query.queries));
    this.query.activeFacets = this.query.activeFacets && JSON.parse(decodeURIComponent(this.query.activeFacets));
    this.body = yield ebscoPublicationSearch(this.query, sessionToken, authToken);
};
