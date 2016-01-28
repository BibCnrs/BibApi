import retrieveParser from '../../services/retrieveParser';
import ebscoEdsRetrieve from '../../services/ebscoEdsRetrieve';

export const retrieve = function* retrieve(domainName, dbId, an) {
    const { userId, password, profile } = this.domain;
    const authToken = yield this.getAuthenticationToken(domainName, userId, password);
    const sessionToken = yield this.getSessionToken(domainName, profile, authToken);
    const result = yield ebscoEdsRetrieve(dbId, an, sessionToken, authToken);
    this.body = retrieveParser(result.Record);
};

export const retrievePure = function* retrievePure(domainName, dbId, an) {
    const { userId, password, profile } = this.domain;
    const authToken = yield this.getAuthenticationToken(domainName, userId, password);
    const sessionToken = yield this.getSessionToken(domainName, profile, authToken);
    this.body = yield ebscoEdsRetrieve(dbId, an, sessionToken, authToken);
};