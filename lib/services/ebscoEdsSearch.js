'use strict';

import request  from 'request-promise';
import { ebsco } from 'config';

export default function* search(term, session) {
    return yield request.post({
        url: `${ebsco.host}${ebsco.port ? `:${ebsco.port}`: ''}/edsapi/rest/Search`,
        json: {
            SearchCriteria: {
                Queries: [
                    { Term: term }
                ],
                SearchMode: 'all',
                IncludeFacets: 'n',
                Limiters: [
                    {
                        Id: 'FT', // fulltext
                        Values: ['y']
                    }
                ],
                Expanders: [],
                Sort:'relevance'
            },
            RetrievalCriteria: {
                View: 'detailed',
                ResultsPerPage: ebsco.resultsPerPage,
                PageNumber: 1,
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
