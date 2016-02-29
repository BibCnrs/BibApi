import request  from 'request-promise';
import { ebsco, allowedLimiters } from 'config';
import handleEbscoError from './handleEbscoError';

import { unparse as unparseActiveFacet } from './activeFacetParser';

export const getEbscoQuery = function getAjaxQuery(query = {}) {
    const actions = query.action ? [
        `goToPage(${query.currentPage || 1})`,
        query.action
    ] : [ `goToPage(${query.currentPage || 1})` ];

    return {
        SearchCriteria: {
            Queries: [
                { Term: query.term }
            ],
            SearchMode: 'all',
            IncludeFacets: 'y',
            FacetFilters: query.activeFacets ? unparseActiveFacet(JSON.parse(decodeURIComponent(query.activeFacets))) : [],
            Limiters: Object.keys(query)
            .filter((id) => allowedLimiters.indexOf(id) !== -1)
            .map((id) => ({
                Id: id,
                Values: [].concat(query[id])
            })),
            Expanders: [],
            Sort: query.sort || 'relevance'
        },
        RetrievalCriteria: {
            View: 'brief',
            ResultsPerPage: ebsco.resultsPerPage,
            PageNumber: 1,
            Highlight: 'n'
        },
        Actions: actions
    };
};

export default function (api) {
    return function* search(query = {}, sessionToken, authToken) {

        return yield request.post({
            url: `${ebsco.host}${ebsco.port ? `:${ebsco.port}`: ''}/edsapi/${api}/Search`,
            json: getEbscoQuery(query),
            proxy: ebsco.proxy,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'x-authenticationToken': authToken,
                'x-sessionToken': sessionToken
            }
        })
        .catch(handleEbscoError);
    };
}
