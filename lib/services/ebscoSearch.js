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
            term:
                'AND (LN edsagr OR LN edsaul OR LN edsupa OR LN edsupe OR LN edsarx OR LN edsbio OR LN edscrn OR LN edscrl OR LN edschs OR LN edscdp OR LN edscog OR LN edsclk OR LN edshld OR LN edsdnp OR LN edsdzs OR LN edsdoj OR LN edszbw OR LN eric OR LN edseli OR LN edseru OR LN edssch OR LN edseul OR LN edseur OR LN edsgal OR LN edshlc OR LN edshtl OR LN edshla OR LN edsinz OR LN edsupi OR LN edsnij OR LN edslao OR LN edslap OR LN edsluc OR LN edsman OR LN cmedm OR LN edsuph OR LN edsnas OR LN edsnor OR LN edsoai OR LN edsoap OR LN edssun OR LN edsair OR LN edsper OR LN edsrev OR LN edsorb OR LN edsupp OR LN edseuc OR LN edsnzl OR LN edsrac OR LN edsrec OR LN edsrep OR LN conrmitp OR LN edssci OR LN edsscb OR LN edsstc OR LN edsgso OR LN edssvk OR LN edslib OR LN edstdx OR LN edstox OR LN edspeb OR LN edsswe)',
        });
    }
    return {
        SearchCriteria: {
            Queries: query.queries
                ? query.queries.map(q => ({
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
                              .filter(id => allowedLimiters.indexOf(id) !== -1)
                              .map(id => ({
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

export default function(api) {
    return function* search(query = {}, sessionToken, authToken, view) {
        console.log(JSON.stringify(getEbscoQuery(query)));
        return yield ebscoRequest(
            `/edsapi/${api}/Search`,
            getEbscoQuery(query),
            authToken,
            sessionToken,
            view,
        );
    };
}
