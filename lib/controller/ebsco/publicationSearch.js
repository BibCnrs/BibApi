import ebscoPublicationSearch from '../../services/ebscoPublicationSearch';
import searchPublicationParser from '../../services/searchPublicationParser';

export const publicationSearch = function* publicationSearch(domainName) {
    const { userId, password, profile } = this.domain;
    const authToken = yield this.getAuthenticationToken(domainName, userId, password);
    const sessionToken = yield this.getSessionToken(domainName, profile, authToken);
    if (!sessionToken) {
        this.status = 401;
        return;
    }
    const result = yield ebscoPublicationSearch(this.query, sessionToken, authToken);
    this.body = searchPublicationParser(result);
};

export const publicationSearchPure = function* publicationSearchPure(domainName) {
    const { userId, password, profile } = this.domain;
    const authToken = yield this.getAuthenticationToken(domainName, userId, password);
    const sessionToken = yield this.getSessionToken(domainName, profile, authToken);
    if (!sessionToken) {
        this.status = 401;
        return;
    }
    this.body = yield ebscoPublicationSearch(this.query, sessionToken, authToken);
};
