import ebscoEdsRetrieve from '../../services/ebscoEdsRetrieve';
import articleLinkParser from '../../services/articleLinkParser';

export const articleRetrievePdfLink = function* articleRetrievePdfLink(domainName, dbId, an) {
    const { userId, password, profile } = this.domain;
    const authToken = yield this.getAuthenticationToken(domainName, userId, password);
    const sessionToken = yield this.getSessionToken(domainName, profile, authToken);
    const result = yield ebscoEdsRetrieve(dbId, an, sessionToken, authToken);

    this.body = {
        url: yield articleLinkParser(result.Record)
    };
};
