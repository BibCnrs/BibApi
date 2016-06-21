import configurable from '../utils/configurable';

export default function (redis, username, domains, ebscoSession) {
    const config = {
        redis,
        username,
        domains,
        ebscoSession
    };

    const get = function* get(domainName, profile, authToken) {

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

    const invalidate = function* (domainName) {
        const {
            redis,
            username
        } = config;

        const redisKey = `${username}-${domainName}`;
        yield redis.delAsync(redisKey);
    };

    return configurable({
        get,
        invalidate
    }, config);
}
