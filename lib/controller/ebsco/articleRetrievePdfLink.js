import ebscoEdsRetrieve from '../../services/ebscoEdsRetrieve';
import articleLinkParser from '../../services/articleLinkParser';

export const articleRetrievePdfLink = function* articleRetrievePdfLink(domainName, dbId, an) {
    const { user_id, password, profile } = this.domain;
    const authToken = yield this.getAuthenticationToken(domainName, user_id, password);
    const sessionToken = yield this.sessionToken.get(domainName, profile, authToken);
    try {
        const result = yield ebscoEdsRetrieve(dbId, an, sessionToken, authToken);
        this.body = {
            url: yield articleLinkParser(result.Record)
        };
    } catch (error) {
        yield this.sessionToken.invalidate(domainName);
        throw error;
    }
};
