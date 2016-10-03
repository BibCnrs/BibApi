export default function* createSession () {
    const Profile = this.request.body.Profile;
    if (Profile === 'profileVie') {
        return this.body = {
            SessionToken: 'token-for-profile-vie'
        };
    }

    if (Profile === 'profileShs') {
        return this.body = {
            SessionToken: 'token-for-profile-shs'
        };
    }

    this.status = 400;
    this.body = {
        DetailedErrorDescription: `Profile: ${Profile}.`,
        ErrorDescription: 'Profile ID is not assocated with caller\'s credentials.',
        ErrorNumber: 144
    };

    return yield Promise.resolve();
}
