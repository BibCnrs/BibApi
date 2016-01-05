'use strict';

import retrieveParser from '../services/retrieveParser';
import ebscoEdsRetrieve from '../services/ebscoEdsRetrieve';

export const retrieve = function* retrieve() {
    const { dbId, an, profile } = this.params;
    const authToken = yield this.getAuthenticationToken(profile);
    const sessionToken = yield this.getSessionToken(profile, authToken);
    const result = yield ebscoEdsRetrieve(dbId, an, sessionToken, authToken);
    this.body = retrieveParser(result.Record);
};

export const retrievePure = function* retrievePure() {
    const { dbId, an, profile } = this.params;
    const authToken = yield this.getAuthenticationToken(profile);
    const sessionToken = yield this.getSessionToken(profile, authToken);
    this.body = yield ebscoEdsRetrieve(dbId, an, sessionToken, authToken);
};
