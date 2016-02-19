import ebscoPublicationSearch from '../../services/ebscoPublicationSearch';

export const publicationSearchPure = function* publicationSearchPure(domainName) {
    const { userId, password, profile } = this.domain;
    const authToken = yield this.getAuthenticationToken(domainName, userId, password);
    const sessionToken = yield this.getSessionToken(domainName, profile, authToken);
    this.body = yield ebscoPublicationSearch(this.query, sessionToken, authToken);
};
