export default function (redis, ebscoAuthentication) {
    return function* getAuthenticationToken(name, userId, password) {

        const token = yield redis.getAsync(name);
        if (token) {
            return token;
        }
        const { AuthToken, AuthTimeout } = yield ebscoAuthentication(userId, password);
        yield redis.setAsync(name, AuthToken);
        yield redis.expireAsync(name, AuthTimeout - 5);

        return AuthToken;
    };
}
