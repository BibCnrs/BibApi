import {ebsco} from 'config';
import articleParser from './articleParser';

export default function (searchResults) {
    if (searchResults.SearchResult.Statistics.TotalHits === 0) {
        return {
            results: [],
            totalHits: 0,
            currentPage: 1,
            maxPage: 1,
            facets: [],
            activeFacets: []
        };
    }
    return {
        results: searchResults.SearchResult.Data.Records.map(articleParser),
        totalHits: searchResults.SearchResult.Statistics.TotalHits,
        currentPage: searchResults.SearchRequest.RetrievalCriteria.PageNumber,
        maxPage: Math.ceil(searchResults.SearchResult.Statistics.TotalHits / ebsco.resultsPerPage),
        facets: searchResults.SearchResult.AvailableFacets,
        activeFacets: searchResults.SearchRequest.SearchCriteria.FacetFilters
    };
}
