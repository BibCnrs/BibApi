import searchParser from '../services/searchParser';
import ebscoEdsSearch from '../services/ebscoEdsSearch';

export const search = function* search(profile, term) {
    const authToken = yield this.getAuthenticationToken(profile);
    const sessionToken = yield this.getSessionToken(profile, authToken);
    if (!sessionToken) {
        this.status = 401;
        return;
    }
    const result = yield ebscoEdsSearch(term, this.query, sessionToken, authToken);
    if (result.SearchResult.Statistics.TotalHits === 0) {
        this.body = 'No Result found';
        this.status = 404;
        return;
    }

    this.body = searchParser(result);
};

export const searchPure = function* searchPure(profile, term) {
    const authToken = yield this.getAuthenticationToken(profile);
    const sessionToken = yield this.getSessionToken(profile, authToken);
    this.body = yield ebscoEdsSearch(term, this.query, sessionToken, authToken);
};
