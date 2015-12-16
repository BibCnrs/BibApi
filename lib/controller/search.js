import searchParser from '../services/searchParser';
import ebscoEdsSearch from '../services/ebscoEdsSearch';

export const search = function* search() {
    const sessionTokens = this.state.user.SessionTokens;
    const { term, profile } = this.params;

    try {
        if (Object.keys(sessionTokens).indexOf(profile) === -1) {
            this.body = `You are not authorized to access profile ${this.params.profile}`;
            this.status = 401;
            return;
        }
        const sessionToken = sessionTokens[profile];
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
    } catch (error) {
        if (!error.error || !error.error.description) {
            throw error;
        }
        this.status = error.statusCode || 500;
        this.body = error.error.ErrorDescription || error.message;
    }
};

export const searchPure = function* searchPure() {
    try {
        this.body = yield ebscoEdsSearch(this.params.term, this.query, this.state.user.SessionToken);
    } catch (error) {
        this.status = error.statusCode || 500;
        this.body = error.error.ErrorDescription || error.message;
    }
};
