import configurable from '../utils/configurable';

export default function (redis, username, domains, ebscoSession, ebscoAuthentication) {
    const config = {
        redis,
        username,
        domains,
        ebscoSession,
        ebscoAuthentication
    };

    const get = function* get(domainName, userId, password, profile) {

        const {
            redis,
            username,
            domains,
            ebscoSession,
            ebscoAuthentication
        } = config;

        if (domains.indexOf(domainName) === -1) {
            let error = new Error(`You are not authorized to access domain ${domainName}`);
            error.status = 401;
            throw error;
        }

        let [authToken, sessionToken] = yield redis.hmget('domainName', ['authToken', username]);

        if(authToken && sessionToken) {
            return {
                authToken,
                sessionToken
            };
        }

        const { AuthToken, AuthTimeout } = yield ebscoAuthentication(userId, password);
        yield redis.hsetAsync(domainName, 'authToken', AuthToken);
        yield redis.expireAsync(domainName, AuthTimeout - 5);

        const { SessionToken } = yield ebscoSession.getSession(profile, authToken);

        yield redis.hsetAsync(domainName, username, SessionToken);

        return {
            authToken: AuthToken,
            sessionToken: SessionToken
        };
    };

    const invalidate = function* (domainName) {
        const {
            redis,
            username
        } = config;

        yield redis.hdelAsync(domainName, username);
    };

    return configurable({
        get,
        invalidate
    }, config);
}
