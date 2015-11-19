'use strict';

import config from 'config';
import * as session from '../services/ebscoSession';
import searchParser from '../services/searchParser';
import ebscoEdsSearch from '../services/ebscoEdsSearch';

export const search = function* search() {
    const { SessionToken } = yield session.getSession(config.ebsco.profile.vie);

    try {
        const result = yield ebscoEdsSearch(this.params.term, this.query, SessionToken);
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
    const { SessionToken } = yield session.getSession(config.ebsco.profile.vie);

    try {
        this.body = yield ebscoEdsSearch(this.params.term, this.query, SessionToken);
    } catch (error) {
        this.status = error.statusCode || 500;
        this.body = error.error.ErrorDescription || error.message;
    }
};
