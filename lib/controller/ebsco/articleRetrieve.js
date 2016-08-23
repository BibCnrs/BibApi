import retrieveArticleParser from '../../services/retrieveArticleParser';
import ebscoEdsRetrieve from '../../services/ebscoEdsRetrieve';

export const articleRetrieve = function* articleRetrieve(domainName, dbId, an) {
    const { user_id, password, profile } = this.domain;
    const { authToken, sessionToken} = yield this.ebscoToken.get(domainName, user_id, password, profile);

    try {
        const result = yield ebscoEdsRetrieve(dbId, an, sessionToken, authToken);
        this.body = yield retrieveArticleParser(result.Record);
    } catch (error) {
        yield this.ebscoToken.invalidate(domainName);
        throw error;
    }
};

export const articleRetrievePure = function* articleRetrievePure(domainName, dbId, an) {
    const { user_id, password, profile } = this.domain;
    const { authToken, sessionToken} = yield this.ebscoToken.get(domainName, user_id, password, profile);

    try {
        this.body = yield ebscoEdsRetrieve(dbId, an, sessionToken, authToken);
    } catch (error) {
        yield this.ebscoToken.invalidate(domainName);
        throw error;
    }
};
