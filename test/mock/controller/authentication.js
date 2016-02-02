'use strict';

export default function* createSession () {
    const { UserId, Password } = this.request.body;
    if (UserId === 'vieUserId' && Password === 'viePassword') {
        return this.body = {
            SessionToken: 'auth-token-for-vie'
        };
    }

    if (UserId === 'shsUserId' && Password === 'shsPassword') {
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
