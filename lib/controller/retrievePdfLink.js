'use strict';

import ebscoEdsRetrieve from '../services/ebscoEdsRetrieve';

export const retrievePdfLink = function* retrieve() {
    const { dbId, an, profile } = this.params;
    const authToken = yield this.getAuthenticationToken(profile);
    const sessionToken = yield this.getSessionToken(profile, authToken);
    const result = yield ebscoEdsRetrieve(dbId, an, sessionToken, authToken);

    this.body = {
        url: result.Record.FullText.Links.map(link => link.Url)
    };
};
