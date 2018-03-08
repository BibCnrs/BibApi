import get from 'lodash.get';

import ebscoArticleSearch from './ebscoArticleSearch';
import searchArticleParser from './searchArticleParser';
import getDOIFromQuery from './getDOIFromQuery';
import getInfoFromDOI from './getInfoFromDOI';

export const getRetryQuery = async query => {
    const doi = getDOIFromQuery(query);

    if (!doi) {
        return null;
    }

    const { title } = await getInfoFromDOI(doi);
    if (!title) {
        return null;
    }

    return {
        ...query,
        queries: [{ field: 'TI', term: title, boolean: 'AND' }],
    };
};

export const searchArticleFactory = ({ search, parse, getRetryQuery }) =>
    function* searchArticle(domainName, domain, query, ebscoToken) {
        const { user_id, password, profile } = domain;
        const { authToken, sessionToken } = yield ebscoToken.get(
            domainName,
            user_id,
            password,
            profile,
        );

        try {
            let result = yield search(query, sessionToken, authToken);
            if (!get(result, 'SearchResult.Statistics.TotalHits', 0)) {
                const retryQuery = yield getRetryQuery(query);
                if (retryQuery) {
                    result = yield search(retryQuery, sessionToken, authToken);
                }
            }
            return yield parse(result);
        } catch (error) {
            yield ebscoToken.invalidateSession(domainName);
            throw error;
        }
    };

export default searchArticleFactory({
    search: ebscoArticleSearch,
    parse: searchArticleParser,
    getRetryQuery,
});
