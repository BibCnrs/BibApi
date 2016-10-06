import ebscoPublicationRetrieve from '../../services/ebscoPublicationRetrieve';
import retry from '../../utils/retry';
import retrievePublication from '../../services/retrievePublication';

export const publicationRetrieve = function* articleRetrieve(domainName, id) {
    try {
        this.body = yield retry(retrievePublication, [domainName, id, this.domain, this.ebscoToken]);
    } catch (error) {
        yield this.ebscoToken.invalidateAuth(domainName);
        throw error;
    }
};

export const publicationRetrievePure = function* publicationRetrievePure(domainName, id) {
    const { user_id, password, profile } = this.domain;
    const { authToken, sessionToken} = yield this.ebscoToken.get(domainName, user_id, password, profile);
    try{
        this.body = yield ebscoPublicationRetrieve(id, sessionToken, authToken);
    } catch (error) {
        yield this.ebscoToken.invalidateSession(domainName);
        throw error;
    }
};
