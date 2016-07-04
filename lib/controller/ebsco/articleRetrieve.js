import body from 'co-body';

import retrieveArticleParser from '../../services/retrieveArticleParser';
import ebscoEdsRetrieve from '../../services/ebscoEdsRetrieve';

export const articleRetrieve = function* articleRetrieve(domainName, dbId, an) {
    const { user_id, password, profile } = this.domain;
    const authToken = yield this.getAuthenticationToken(domainName, user_id, password);
    const sessionToken = yield this.sessionToken.get(domainName, profile, authToken);

    try {
        const result = yield ebscoEdsRetrieve(dbId, an, sessionToken, authToken);
        this.body = yield retrieveArticleParser(result.Record);
    } catch (error) {
        yield this.sessionToken.invalidate(domainName);
        throw error;
    }
};

export const batchArticleRetrieve = function* batchArticleRetrieve(domainName) {
    const { ids } = yield body(this);
    const { user_id, password, profile } = this.domain;
    const authToken = yield this.getAuthenticationToken(domainName, user_id, password);
    const sessionToken = yield this.sessionToken.get(domainName, profile, authToken);

    try {
        const results = yield ids.map(({ dbId, an }) => ebscoEdsRetrieve(dbId, an, sessionToken, authToken));
        this.body = yield results.map(result => retrieveArticleParser(result.Record));
    } catch (error) {
        yield this.sessionToken.invalidate(domainName);
        throw error;
    }
};

export const articleRetrievePure = function* articleRetrievePure(domainName, dbId, an) {
    const { user_id, password, profile } = this.domain;
    const authToken = yield this.getAuthenticationToken(domainName, user_id, password);
    const sessionToken = yield this.sessionToken.get(domainName, profile, authToken);

    try {
        this.body = yield ebscoEdsRetrieve(dbId, an, sessionToken, authToken);
    } catch (error) {
        yield this.sessionToken.invalidate(domainName);
        throw error;
    }
};
