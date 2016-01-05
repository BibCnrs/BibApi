'use strict';

import { ebsco } from 'config';

export default function* createSession () {
    const { UserId, Password } = this.request.body;
    if (UserId === ebsco.vie.userId && Password === ebsco.vie.password) {
        return this.body = {
            SessionToken: 'auth-token-for-vie'
        };
    }

    if (UserId === ebsco.shs.userId && Password === ebsco.shs.password) {
        return this.body = {
            SessionToken: 'auth-token-for-shs'
        };
    }

    this.status = 400;
    this.body = {
        ErrorCode: 1102,
        Reason: 'Invalid Credentials.'
    };
}
