import configurable from '../utils/configurable';

export default function (
    redis,
    username,
    domains,
    ebscoSession,
    ebscoAuthentication,
) {
    const config = {
        redis,
        username,
        domains,
        ebscoSession,
        ebscoAuthentication,
    };

    const get = function* get(domainName, userId, password, profile) {
        const { redis, username, domains, ebscoSession, ebscoAuthentication } =
            config;

        if (domains.indexOf(domainName) === -1) {
            let error = new Error(
                `You are not authorized to access domain ${domainName}`,
            );
            error.status = 401;
            throw error;
        }
        let [authToken, sessionToken] = yield redis.hmgetAsync(
            domainName,
            'authToken',
            username,
        );
        if (authToken && sessionToken) {
            return {
                authToken,
                sessionToken,
            };
        }

        if (!authToken) {
            const { AuthToken, AuthTimeout } = yield ebscoAuthentication(
                userId,
                password,
            );
            authToken = AuthToken;
            yield redis.hsetAsync(domainName, 'authToken', authToken);
            yield redis.expireAsync(domainName, parseInt(AuthTimeout) - 5);
        }

        const { SessionToken } = yield ebscoSession(profile, authToken);
        sessionToken = SessionToken;
        yield redis.hsetAsync(domainName, username, sessionToken);

        return {
            authToken,
            sessionToken,
        };
    };

    const invalidateSession = function* (domainName) {
        const { redis, username } = config;

        yield redis.hdelAsync(domainName, username);
    };

    const invalidateAuth = function* (domainName) {
        const { redis } = config;

        yield redis.delAsync(domainName);
    };

    return configurable(
        {
            get,
            invalidateSession,
            invalidateAuth,
        },
        config,
    );
}
