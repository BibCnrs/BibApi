export default function (redis, user, getAuthenticationToken, ebscoSession, ebscoConfig) {
    return function* getSessionToken(profile) {
        if (user.get('domains').indexOf(profile) === -1) {
            let error = new Error(`You are not authorized to access profile ${profile}`);
            error.statusCode = 401;
            throw error;
        }

        const redisKey = `${user.get('username')}-${profile}`;

        let token = yield redis.getAsync(redisKey);
        if (token) {
            return token;
        }

        const authToken = yield getAuthenticationToken(profile);

        const { SessionToken } = yield ebscoSession.getSession(ebscoConfig[profile].profile, authToken);

        yield redis.setAsync(redisKey, SessionToken);
        yield redis.expireAsync(redisKey, 1800 - 5);

        return SessionToken;
    };
}
