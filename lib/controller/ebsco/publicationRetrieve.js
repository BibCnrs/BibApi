import retrievePublicationParser from '../../services/retrievePublicationParser';
import ebscoPublicationRetrieve from '../../services/ebscoPublicationRetrieve';

export const publicationRetrieve = function* articleRetrieve(domainName, id) {
    const { userId, password, profile } = this.domain;
    const authToken = yield this.getAuthenticationToken(domainName, userId, password);
    const sessionToken = yield this.getSessionToken(domainName, profile, authToken);
    const result = yield ebscoPublicationRetrieve(id, sessionToken, authToken);
    this.body = retrievePublicationParser(result.Record);
};

export const publicationRetrievePure = function* publicationRetrievePure(domainName, id) {
    const { userId, password, profile } = this.domain;
    const authToken = yield this.getAuthenticationToken(domainName, userId, password);
    const sessionToken = yield this.getSessionToken(domainName, profile, authToken);
    this.body = yield ebscoPublicationRetrieve(id, sessionToken, authToken);
};
