'use strict';

import retrieveParser from '../services/retrieveParser';
import ebscoEdsRetrieve from '../services/ebscoEdsRetrieve';

export const retrieve = function* retrieve() {
    const { dbId, an, profile } = this.params;
    try {
        if (Object.keys(this.state.user.SessionTokens).indexOf(profile) === -1) {
            this.body = `You are not authorized to access profile ${profile}`;
            this.status = 401;
            return;
        }
        const result = yield ebscoEdsRetrieve(dbId, an, this.state.user.SessionTokens[profile]);
        this.body = retrieveParser(result.Record);
    } catch (error) {
        if (!error.error || !error.error.ErrorDescription) {
            throw error;
        }
        if (error.error.ErrorNumber === '132' || error.error.ErrorNumber === '135') {
            this.status = 404;
            this.body = 'Not Found';
            return;
        }
        this.status = error.statusCode || 500;
        this.body = error.error.ErrorDescription || error.message;
    }
};

export const retrievePure = function* retrievePure() {
    const { dbId, an, profile } = this.params;
    try {
        if (Object.keys(this.state.user.SessionTokens).indexOf(profile) === -1) {
            this.body = `You are not authorized to access profile ${profile}`;
            this.status = 401;
            return;
        }
        this.body = yield ebscoEdsRetrieve(dbId, an, this.state.user.SessionTokens[profile]);
    } catch (error) {
        this.status = error.statusCode || 500;
        this.body = error.error.ErrorDescription || error.message;
    }
};
