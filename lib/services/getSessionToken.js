import configurable from '../utils/configurable';

export default function (redis, user, ebscoSession) {
    const config = {
        redis,
        user,
        ebscoSession
    };

    const getSessionToken = function* getSessionToken(domainName, profile, authToken) {
        const {
            redis,
            user,
            ebscoSession
        } = config;

        if (user && user.domains.indexOf(domainName) === -1) {
            let error = new Error(`You are not authorized to access domain ${domainName}`);
            error.status = 401;
            throw error;
        }
        const redisKey = `${user ? user.username : 'guest' }-${domainName}`;

        let token = yield redis.getAsync(redisKey);
        if (token) {
            return token;
        }

        const { SessionToken } = yield ebscoSession.getSession(profile, authToken);

        yield redis.setAsync(redisKey, SessionToken);
        yield redis.expireAsync(redisKey, 1800 - 5);

        return SessionToken;
    };

    return configurable(getSessionToken, config);
}
