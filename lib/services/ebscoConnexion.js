import retry from '../utils/retry';

export default (callEbsco) => (domain, ebscoToken) => {
    return function* ebscoConnexion(...args) {
        const task = retry(function* (...args) {
            const { authToken, sessionToken } = yield ebscoToken.get(
                domain.name,
                domain.user_id,
                domain.password,
                domain.profile,
            );
            try {
                return yield callEbsco(sessionToken, authToken)(...args);
            } catch (error) {
                yield ebscoToken.invalidateSession(domain.name);
                throw error;
            }
        }, 5);

        try {
            return yield task(...args);
        } catch (error) {
            yield ebscoToken.invalidateAuth(domain.name);
            throw error;
        }
    };
};
