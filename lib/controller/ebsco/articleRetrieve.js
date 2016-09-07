import ebscoEdsRetrieve from '../../services/ebscoEdsRetrieve';
import retry from '../../utils/retry';
import retrieveArticle from '../../services/retrieveArticle';

export const articleRetrieve = function* articleRetrieve(domainName, dbId, an) {
    this.body = yield retry(retrieveArticle, [domainName, this.domain, dbId, an, this.ebscoToken]);
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
