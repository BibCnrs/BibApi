import {ebsco} from 'config';
import resultParser from './resultParser';
import activeFacetsParser from './activeFacetsParser';

export default function (searchResults) {
    return {
        results: searchResults.SearchResult.Data.Records.map(resultParser),
        totalHits: searchResults.SearchResult.Statistics.TotalHits,
        currentPage: searchResults.SearchRequest.RetrievalCriteria.PageNumber,
        maxPage: Math.ceil(searchResults.SearchResult.Statistics.TotalHits / ebsco.resultsPerPage),
        facets: searchResults.SearchResult.AvailableFacets,
        activeFacets: activeFacetsParser(searchResults.SearchRequest.SearchCriteriaWithActions.FacetFiltersWithAction)
    };
}
