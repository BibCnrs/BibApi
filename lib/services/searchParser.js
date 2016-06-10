import {ebsco} from 'config';

import { parse as parseActiveFacets } from './activeFacetParser';
import parseDateRange from './parseDateRange';

export default function (parser) {
    return function (searchResults) {
        if (searchResults.SearchResult.Statistics.TotalHits === 0) {
            return {
                results: [],
                totalHits: 0,
                currentPage: 1,
                maxPage: 1,
                facets: [],
                activeFacets: {},
                dateRange: parseDateRange()
            };
        }

        return {
            results: searchResults.SearchResult.Data.Records.map(parser),
            totalHits: searchResults.SearchResult.Statistics.TotalHits,
            currentPage: searchResults.SearchRequest.RetrievalCriteria.PageNumber,
            maxPage: Math.ceil(searchResults.SearchResult.Statistics.TotalHits / searchResults.SearchRequest.RetrievalCriteria.ResultsPerPage),
            facets: searchResults.SearchResult.AvailableFacets,
            activeFacets: parseActiveFacets(searchResults.SearchRequest.SearchCriteria.FacetFilters),
            dateRange: parseDateRange(searchResults.SearchResult)
        };
    };
}
