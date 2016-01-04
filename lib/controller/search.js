import searchParser from '../services/searchParser';
import ebscoEdsSearch from '../services/ebscoEdsSearch';

export const search = function* search() {
    const { term, profile } = this.params;

    const sessionToken = yield this.getSessionToken(profile);

    if (!sessionToken) {
        this.status = 401;
        return;
    }
    const result = yield ebscoEdsSearch(term, this.query, sessionToken);
    if (result.SearchResult.Statistics.TotalHits === 0) {
        this.body = 'No Result found';
        this.status = 404;
        return;
    }

    this.body = searchParser(result);
};

export const searchPure = function* searchPure() {
    const { term, profile } = this.params;
    const sessionToken = yield this.getSessionToken(profile);
    this.body = yield ebscoEdsSearch(term, this.query, sessionToken);
};
