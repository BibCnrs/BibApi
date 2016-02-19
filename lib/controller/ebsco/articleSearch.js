import searchParser from '../../services/searchParser';
import ebscoEdsSearch from '../../services/ebscoEdsSearch';

export const articleSearch = function* articleSearch(domainName) {
    const { userId, password, profile } = this.domain;
    const authToken = yield this.getAuthenticationToken(domainName, userId, password);
    const sessionToken = yield this.getSessionToken(domainName, profile, authToken);
    if (!sessionToken) {
        this.status = 401;
        return;
    }
    const result = yield ebscoEdsSearch(this.query, sessionToken, authToken);

    this.body = searchParser(result);
};

export const articleSearchPure = function* articleSearchPure(domainName) {
    const { userId, password, profile } = this.domain;
    const authToken = yield this.getAuthenticationToken(domainName, userId, password);
    const sessionToken = yield this.getSessionToken(domainName, profile, authToken);
    this.body = yield ebscoEdsSearch(this.query, sessionToken, authToken);
};
