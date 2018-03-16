import ebscoPublicationRetrieve from '../../services/ebscoPublicationRetrieve';
import retrievePublication from '../../services/retrievePublication';

export const publicationRetrieve = function* articleRetrieve(domainName, id) {
    try {
        this.body = yield retrievePublication(
            domainName,
            id,
            this.domain,
            this.ebscoToken,
        );
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

export const publicationRetrievePure = function* publicationRetrievePure(
    domainName,
    id,
) {
    const { user_id, password, profile } = this.domain;
    const { authToken, sessionToken } = yield this.ebscoToken.get(
        domainName,
        user_id,
        password,
        profile,
    );
    try {
        this.body = yield ebscoPublicationRetrieve(id, sessionToken, authToken);
    } catch (error) {
        yield this.ebscoToken.invalidateSession(domainName);
        throw error;
    }
};
