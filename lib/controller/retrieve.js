'use strict';

import config from 'config';
import * as session from '../services/ebscoSession';
import retrieveParser from '../services/retrieveParser';
import ebscoEdsRetrieve from '../services/ebscoEdsRetrieve';

export const retrieve = function* retrieve() {
    const { SessionToken } = yield session.getSession(config.ebsco.profile.vie);

    try {
        const result = yield ebscoEdsRetrieve(this.params.dbId, this.params.an, SessionToken);
        this.body = retrieveParser(result.Record);
    } catch (error) {
        this.status = error.statusCode || 500;
        this.body = error.error.ErrorDescription || error.message;
    }
};

export const retrievePure = function* retrievePure() {
    const { SessionToken } = yield session.getSession(config.ebsco.profile.vie);

    try {
        this.body = yield ebscoEdsRetrieve(this.params.dbId, this.params.an, SessionToken);
    } catch (error) {
        this.status = error.statusCode || 500;
        this.body = error.error.ErrorDescription || error.message;
    }
};
