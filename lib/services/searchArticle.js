import get from 'lodash.get';
import omit from 'lodash.omit';

import ebscoArticleSearch from './ebscoArticleSearch';
import searchArticleParser from './searchArticleParser';
import getDOIFromQuery from './getDOIFromQuery';
import getInfoFromDOI from './getInfoFromDOI';

export const getRetryQuery = async query => {
    const doi = getDOIFromQuery(query);

    if (!doi) {
        return null;
    }

    const { title, issn, isbn } = await getInfoFromDOI(doi);
    if (!title) {
        return null;
    }

    return {
        ...query,
        queries: [
            { field: 'TI', term: title, boolean: 'AND' },
            issn && { field: 'IS', term: issn, boolean: 'AND' },
            isbn && { field: 'IB', term: isbn, boolean: 'AND' },
        ].filter(v => !!v),
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
                    result.doiRetry = true;
                }
                if (
                    !get(result, 'SearchResult.Statistics.TotalHits', 0) &&
                    get(retryQuery, 'FT') === 'Y'
                ) {
                    result = yield search(
                        omit(retryQuery, ['FT']),
                        sessionToken,
                        authToken,
                    );

                    result.noFullText = true;
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
