import retrieveArticleParser from '../../services/retrieveArticleParser';
import ebscoEdsRetrieve from '../../services/ebscoEdsRetrieve';

export const articleRetrieve = function* articleRetrieve(domainName, dbId, an) {
    const { userId, password, profile } = this.domain;
    const authToken = yield this.getAuthenticationToken(domainName, userId, password);
    const sessionToken = yield this.getSessionToken(domainName, profile, authToken);
    const result = yield ebscoEdsRetrieve(dbId, an, sessionToken, authToken);
    this.body = yield retrieveArticleParser(result.Record);
};

export const articleRetrievePure = function* articleRetrievePure(domainName, dbId, an) {
    const { userId, password, profile } = this.domain;
    const authToken = yield this.getAuthenticationToken(domainName, userId, password);
    const sessionToken = yield this.getSessionToken(domainName, profile, authToken);
    this.body = yield ebscoEdsRetrieve(dbId, an, sessionToken, authToken);
};
