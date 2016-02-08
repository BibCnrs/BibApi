import searchParser from '../../services/searchParser';
import ebscoEdsSearch from '../../services/ebscoEdsSearch';

export const search = function* search(domainName) {
    const { userId, password, profile } = this.domain;
    const authToken = yield this.getAuthenticationToken(domainName, userId, password);
    const sessionToken = yield this.getSessionToken(domainName, profile, authToken);
    if (!sessionToken) {
        this.status = 401;
        return;
    }
    const result = yield ebscoEdsSearch(this.query, sessionToken, authToken);
    if (result.SearchResult.Statistics.TotalHits === 0) {
        this.body = 'No Result found';
        this.status = 404;
        return;
    }

    this.body = searchParser(result);
};

export const searchPure = function* searchPure(domainName) {
    const { userId, password, profile } = this.domain;
    const authToken = yield this.getAuthenticationToken(domainName, userId, password);
    const sessionToken = yield this.getSessionToken(domainName, profile, authToken);
    this.body = yield ebscoEdsSearch(this.query, sessionToken, authToken);
};
