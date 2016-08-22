import ebscoPublicationSearch from '../../services/ebscoPublicationSearch';
import searchPublicationParser from '../../services/searchPublicationParser';

export const publicationSearch = function* publicationSearch(domainName) {
    const { user_id, password, profile } = this.domain;
    const { authToken, sessionToken} = yield this.ebscoToken.get(domainName, user_id, password, profile);
    if (!sessionToken) {
        this.status = 401;
        return;
    }
    this.query.queries = JSON.parse(decodeURIComponent(this.query.queries));
    this.query.activeFacets = this.query.activeFacets && JSON.parse(decodeURIComponent(this.query.activeFacets));
    try {
        const result = yield ebscoPublicationSearch(this.query, sessionToken, authToken);
        this.body = searchPublicationParser(result);
    } catch (error) {
        yield this.ebscoToken.invalidate(domainName);
        throw error;
    }
};

export const publicationSearchPure = function* publicationSearchPure(domainName) {
    const { user_id, password, profile } = this.domain;
    const { authToken, sessionToken} = yield this.ebscoToken.get(domainName, user_id, password, profile);
    if (!sessionToken) {
        this.status = 401;
        return;
    }
    this.query.queries = JSON.parse(decodeURIComponent(this.query.queries));
    this.query.activeFacets = this.query.activeFacets && JSON.parse(decodeURIComponent(this.query.activeFacets));
    try {
        this.body = yield ebscoPublicationSearch(this.query, sessionToken, authToken);
    } catch (error) {
        yield this.ebscoToken.invalidate(domainName);
        throw error;
    }
};
