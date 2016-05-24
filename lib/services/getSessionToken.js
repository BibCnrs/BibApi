import configurable from '../utils/configurable';

export default function (redis, username, domains, ebscoSession) {
    const config = {
        redis,
        username,
        domains,
        ebscoSession
    };

    const getSessionToken = function* getSessionToken(domainName, profile, authToken) {

        const {
            redis,
            username,
            domains,
            ebscoSession
        } = config;
        if (domains.indexOf(domainName) === -1) {
            let error = new Error(`You are not authorized to access domain ${domainName}`);
            error.status = 401;
            throw error;
        }
        const redisKey = `${username}-${domainName}`;

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
