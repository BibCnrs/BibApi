import ebscoEdsRetrieve from '../../services/ebscoEdsRetrieve';
import retry from '../../utils/retry';
import retrieveArticle from '../../services/retrieveArticle';

export const articleRetrieve = function* articleRetrieve(domainName, dbId, an) {
    try {
        this.body = yield retry(retrieveArticle, [
            domainName,
            this.domain,
            dbId,
            an,
            this.ebscoToken,
        ]);
    } catch (error) {
        yield this.ebscoToken.invalidateAuth(domainName);
        if (error.message === 'Max retry reached. Giving up.') {
            this.status = 401;
            this.body =
                'Could not connect to ebsco api. Please try again. If the problem persist contact us.';
            return;
        }
        throw error;
    }
};

export const articleRetrievePure = function* articleRetrievePure(
    domainName,
    dbId,
    an,
) {
    const { user_id, password, profile } = this.domain;
    const { authToken, sessionToken } = yield this.ebscoToken.get(
        domainName,
        user_id,
        password,
        profile,
    );

    try {
        this.body = yield ebscoEdsRetrieve(dbId, an, sessionToken, authToken);
    } catch (error) {
        yield this.ebscoToken.invalidateAuth(domainName);
        throw error;
    }
};
