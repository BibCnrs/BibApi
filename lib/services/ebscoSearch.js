import ebscoRequest from './ebscoRequest';
import { allowedLimiters } from 'config';

import { unparse as unparseActiveFacet } from './activeFacetParser';

export const getEbscoQuery = function getAjaxQuery(query = {}, view = 'brief') {
    const actions = query.action
        ? [`goToPage(${query.currentPage || 1})`, query.action]
        : [`goToPage(${query.currentPage || 1})`];

    if (query.OA === 'Y') {
        if (!query.queries) {
            query.queries = [];
        }

        query.queries.push({
            boolean: 'AND',
            field: null,
            term: `LO system.a2731812 OR LO system.a01000000280100001094 OR LO system.a6255937OR OR LN edsdoj OR LN edsdob OR LN edsgso OR LN edsper OR LN edsgal OR LN edseur OR IS edsairFT OR LN edshal`,
        });
    }
    return {
        SearchCriteria: {
            Queries: query.queries
                ? query.queries.map((q) => ({
                      BooleanOperator: q.boolean,
                      FieldCode: q.field,
                      Term: q.term,
                  }))
                : null,
            SearchMode: 'all',
            IncludeFacets: 'y',
            PublicationId: query.publicationId,
            FacetFilters: query.activeFacets
                ? unparseActiveFacet(query.activeFacets)
                : [],
            Limiters:
                query['fullText'] === true
                    ? [{ Id: 'FT', Values: ['Y'] }]
                    : (query.limiters && query.limiters['fullText']) === true
                    ? [{ Id: 'FT', Values: ['Y'] }]
                    : Object.keys(query)
                          .filter((id) => allowedLimiters.indexOf(id) !== -1)
                          .map((id) => ({
                              Id: id,
                              Values: [].concat(query[id]),
                          })),
            Expanders: [],
            Sort: query.sort || 'relevance',
        },
        RetrievalCriteria: {
            View: view,
            ResultsPerPage: query.resultsPerPage,
            PageNumber: 1,
            Highlight: 'n',
        },
        Actions: actions,
    };
};

export default function (api) {
    return function* search(query = {}, sessionToken, authToken, view) {
        return yield ebscoRequest(
            `/edsapi/${api}/Search`,
            getEbscoQuery(query),
            authToken,
            sessionToken,
            view,
        );
    };
}
