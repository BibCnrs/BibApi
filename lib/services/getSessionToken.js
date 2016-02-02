export default function (redis, user, ebscoSession) {
    return function* getSessionToken(domainName, profile, authToken) {

        if (user.domains.indexOf(domainName) === -1) {
            let error = new Error(`You are not authorized to access domain ${domainName}`);
            error.status = 401;
            throw error;
        }

        const redisKey = `${user.username}-${domainName}`;

        let token = yield redis.getAsync(redisKey);
        if (token) {
            return token;
        }

        const { SessionToken } = yield ebscoSession.getSession(profile, authToken);

        yield redis.setAsync(redisKey, SessionToken);
        yield redis.expireAsync(redisKey, 1800 - 5);

        return SessionToken;
    };
}
