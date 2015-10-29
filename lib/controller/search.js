'use strict';

import config from 'config';
import * as session from '../services/ebscoSession';
import searchParser from '../services/searchParser';
import ebscoEdsSearch from '../services/ebscoEdsSearch';

export const search = function* search() {
    const { SessionToken } = yield session.getSession(config.ebsco.profile.vie);

    try {
        const result = yield ebscoEdsSearch(this.params.term, SessionToken);
        this.body = result.SearchResult.Data.Records.map(searchParser);
    } catch (error) {
        this.status = error.statusCode || 500;
        this.body = error.error.ErrorDescription || error.message;
    }
};

export const searchPure = function* searchPure() {
    const { SessionToken } = yield session.getSession(config.ebsco.profile.vie);

    try {
        this.body = yield ebscoEdsSearch(this.params.term, SessionToken);
    } catch (error) {
        this.status = error.statusCode || 500;
        this.body = error.error.ErrorDescription || error.message;
    }
};