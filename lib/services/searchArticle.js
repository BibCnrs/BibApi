import get from 'lodash.get';

import ebscoArticleSearch from './ebscoArticleSearch';
import searchArticleParser from './searchArticleParser';
import isDOI from './isDOI';
import getTitleFromDOI from './getTitleFromDOI';

const getDOIFromQuery = query => {
    if (query.queries.length === 1 && get(query, 'queries[0].field') === null) {
        const term = get(query, 'queries[0].term');
        return isDOI(term) ? term : null;
    }

    return null;
};

const getRetryQuery = async query => {
    const doi = getDOIFromQuery(query);

    if (!doi) {
        return null;
    }

    const title = await getTitleFromDOI(doi);
    if (!title) {
        return null;
    }

    return {
        ...query,
        queries: [{ field: 'TI', term: title, boolean: 'AND' }],
    };
};

export default function* searchArticle(domainName, domain, query, ebscoToken) {
    const { user_id, password, profile } = domain;
    const { authToken, sessionToken } = yield ebscoToken.get(
        domainName,
        user_id,
        password,
        profile,
    );

    try {
        let result = yield ebscoArticleSearch(query, sessionToken, authToken);
        if (!get(result, 'SearchResult.Statistics.TotalHits', 0)) {
            const retryQuery = yield getRetryQuery(query);
            if (retryQuery) {
                result = yield ebscoArticleSearch(
                    retryQuery,
                    sessionToken,
                    authToken,
                );
            }
        }
        return yield searchArticleParser(result);
    } catch (error) {
        yield ebscoToken.invalidateSession(domainName);
        throw error;
    }
}
