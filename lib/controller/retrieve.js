'use strict';

import retrieveParser from '../services/retrieveParser';
import ebscoEdsRetrieve from '../services/ebscoEdsRetrieve';

export const retrieve = function* retrieve() {

    try {
        const result = yield ebscoEdsRetrieve(this.params.dbId, this.params.an, this.state.user.SessionToken);
        this.body = retrieveParser(result.Record);
    } catch (error) {
        this.status = error.statusCode || 500;
        this.body = error.error.ErrorDescription || error.message;
    }
};

export const retrievePure = function* retrievePure() {

    try {
        this.body = yield ebscoEdsRetrieve(this.params.dbId, this.params.an, this.state.user.SessionToken);
    } catch (error) {
        this.status = error.statusCode || 500;
        this.body = error.error.ErrorDescription || error.message;
    }
};
