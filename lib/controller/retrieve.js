'use strict';

import retrieveParser from '../services/retrieveParser';
import ebscoEdsRetrieve from '../services/ebscoEdsRetrieve';

export const retrieve = function* retrieve() {
    const { dbId, an, profile } = this.params;
    const token = yield this.getSessionToken(profile);
    const result = yield ebscoEdsRetrieve(dbId, an, token);
    this.body = retrieveParser(result.Record);
};

export const retrievePure = function* retrievePure() {
    const { dbId, an, profile } = this.params;
    const token = yield this.getSessionToken(profile);
    this.body = yield ebscoEdsRetrieve(dbId, an, token);
};
