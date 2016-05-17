'use strict';

import publicationSearch from './publicationSearch.json';

export default function* search () {
    if (this.request.body.SearchCriteria.Queries[0].Term !== 'aids') {
        this.status = 200;
        this.body = {
            SearchResult: {
                Statistics: {
                    TotalHits: 0
                }
            }
        };
        return;
    }
    this.status = 200;
    this.body = publicationSearch;
}
