'use strict';

import { ebsco } from 'config';

export default function* createSession () {
    const Profile = this.request.body.Profile;
    if (Profile === ebsco.profile.vie) {
        return this.body = {
            SessionToken: 'token-for-profile-vie'
        };
    }

    if (Profile === ebsco.profile.shs) {
        return this.body = {
            SessionToken: 'token-for-profile-shs'
        };
    }

    this.status = 400;
    this.body = {
        DetailedErrorDescription: `Profile: ${Profile}.`,
        ErrorDescription: `Profile ID is not assocated with caller's credentials.`,
        ErrorNumber: 144
    };
}
