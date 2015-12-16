'use strict';

import request  from 'request-promise';
import { ebsco, allowedLimiters } from 'config';

export default function* search(term, query = {}, session) {
    return yield request.post({
        url: `${ebsco.host}${ebsco.port ? `:${ebsco.port}`: ''}/edsapi/rest/Search`,
        json: {
            SearchCriteria: {
                Queries: [
                    { Term: term }
                ],
                SearchMode: 'all',
                IncludeFacets: 'n',
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
                PageNumber: query.currentPage || 1,
                Highlight: 'n'
            },
            Actions: null
        },
        proxy: ebsco.proxy,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-sessionToken': session
        }
    });
}
