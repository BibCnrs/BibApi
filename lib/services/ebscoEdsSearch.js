'use strict';

import request  from 'request-promise';
import { ebsco, allowedLimiters } from 'config';
import handleEbscoError from './handleEbscoError';

export default function* search(term, query = {}, sessionToken, authToken) {

    const actions = query.action ? [
        `goToPage(${query.currentPage || 1})`,
        query.action
    ] : [ `goToPage(${query.currentPage || 1})` ];

    return yield request.post({
        url: `${ebsco.host}${ebsco.port ? `:${ebsco.port}`: ''}/edsapi/rest/Search`,
        json: {
            SearchCriteria: {
                Queries: [
                    { Term: term }
                ],
                SearchMode: 'all',
                IncludeFacets: 'y',
                Limiters: Object.keys(query)
                .filter((id) => allowedLimiters.indexOf(id) !== -1)
                .map((id) => ({
                    Id: id,
                    Values: Array.isArray(query[id]) ? query[id] : [query[id]]
                })),
                Expanders: [],
                Sort:'relevance'
            },
            RetrievalCriteria: {
                View: 'detailed',
                ResultsPerPage: ebsco.resultsPerPage,
                PageNumber: 1,
                Highlight: 'n'
            },
            Actions: actions
        },
        proxy: ebsco.proxy,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-authenticationToken': authToken,
            'x-sessionToken': sessionToken
        }
    })
    .catch(handleEbscoError);
}
