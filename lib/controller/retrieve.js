'use strict';

import retrieveParser from '../services/retrieveParser';
import ebscoEdsRetrieve from '../services/ebscoEdsRetrieve';

export const retrieve = function* retrieve() {
    const { dbId, an, profile } = this.params;
    if (Object.keys(this.state.user.SessionTokens).indexOf(profile) === -1) {
        this.body = `You are not authorized to access profile ${profile}`;
        this.status = 401;
        return;
    }
    const result = yield ebscoEdsRetrieve(dbId, an, this.state.user.SessionTokens[profile]);
    this.body = retrieveParser(result.Record);
};

export const retrievePure = function* retrievePure() {
    const { dbId, an, profile } = this.params;
    if (Object.keys(this.state.user.SessionTokens).indexOf(profile) === -1) {
        this.body = `You are not authorized to access profile ${profile}`;
        this.status = 401;
        return;
    }
    this.body = yield ebscoEdsRetrieve(dbId, an, this.state.user.SessionTokens[profile]);
};
