import get from 'lodash/get';
import omit from 'lodash/omit';

import ebscoArticleSearch from './ebscoArticleSearch';
import getDOIFromQuery from './getDOIFromQuery';
import getInfoFromDOI from './getInfoFromDOI';
import ebscoConnexion from './ebscoConnexion';

export const getRetryQuery = async (query) => {
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
        ].filter((v) => !!v),
    };
};

export const searchArticleFactory =
    ({ search, getRetryQuery }) =>
    (sessionToken, authToken) =>
        function* searchArticle(query, view) {
            let result = yield search(query, sessionToken, authToken, view);
            if (!get(result, 'SearchResult.Statistics.TotalHits', 0)) {
                const retryQuery = yield getRetryQuery(query);
                if (retryQuery) {
                    result = yield search(
                        retryQuery,
                        sessionToken,
                        authToken,
                        view,
                    );
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
                        view,
                    );

                    result.noFullText = true;
                }
            }

            return result;
        };

export default ebscoConnexion(
    searchArticleFactory({
        search: ebscoArticleSearch,
        getRetryQuery,
    }),
);
