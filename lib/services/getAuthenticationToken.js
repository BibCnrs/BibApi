export default function (redis, ebscoAuthentication, ebscoConfig) {
    return function* getAuthenticationToken(profile) {
        const token = yield redis.getAsync(profile);
        if (token) {
            return token;
        }
        const { userId, password } = ebscoConfig[profile];
        const { AuthToken, AuthTimeout } = yield ebscoAuthentication(userId, password);
        yield redis.setAsync(profile, AuthToken);
        yield redis.expireAsync(profile, AuthTimeout - 5);

        return AuthToken;
    };
}
