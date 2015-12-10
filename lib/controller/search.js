import searchParser from '../services/searchParser';
import ebscoEdsSearch from '../services/ebscoEdsSearch';

export const search = function* search() {
    try {
        if (Object.keys(this.state.user.SessionTokens).indexOf(this.params.profile) === -1) {
            this.body = `You are not authorized to access profile ${this.params.profile}`;
            this.status = 401;
            return;
        }
        const sessionToken = this.state.user.SessionTokens[this.params.profile];
        if (!sessionToken) {
            this.status = 401;
            return;
        }
        const result = yield ebscoEdsSearch(this.params.term, this.query, sessionToken);
        if (result.SearchResult.Statistics.TotalHits === 0) {
            this.body = 'No Result found';
            this.status = 404;
            return;
        }
        this.body = result.SearchResult.Data.Records.map(searchParser);
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
