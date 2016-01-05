export default function (redis, user, ebscoSession, ebscoConfig) {
    return function* getSessionToken(profile, authToken) {
        if(!ebscoConfig[profile]) {
            const error = new Error(`profile ${profile} does not exists`);
            error.status = 500;
            throw error;
        }
        if (user.domains.indexOf(profile) === -1) {
            let error = new Error(`You are not authorized to access profile ${profile}`);
            error.status = 401;
            throw error;
        }

        const redisKey = `${user.username}-${profile}`;

        let token = yield redis.getAsync(redisKey);
        if (token) {
            return token;
        }

        const { SessionToken } = yield ebscoSession.getSession(ebscoConfig[profile].profile, authToken);

        yield redis.setAsync(redisKey, SessionToken);
        yield redis.expireAsync(redisKey, 1800 - 5);

        return SessionToken;
    };
}
