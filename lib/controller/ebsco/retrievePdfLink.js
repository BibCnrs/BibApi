import ebscoEdsRetrieve from '../../services/ebscoEdsRetrieve';

export const retrievePdfLink = function* retrieve(domainName, dbId, an) {
    const { userId, password, profile } = this.domain;
    const authToken = yield this.getAuthenticationToken(domainName, userId, password);
    const sessionToken = yield this.getSessionToken(domainName, profile, authToken);
    const result = yield ebscoEdsRetrieve(dbId, an, sessionToken, authToken);

    this.body = {
        url: result.Record.FullText.Links.map(link => link.Url)
    };
};
