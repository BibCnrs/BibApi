import { parse as parseActiveFacets } from './activeFacetParser';
import { sortFacet } from './facetSorter';
import parseDateRange from './parseDateRange';

export default function (parser) {
    return function (searchResults, domain) {
        if (searchResults.SearchResult.Statistics.TotalHits === 0) {
            return {
                results: [],
                totalHits: 0,
                currentPage: 1,
                maxPage: 1,
                facets: [],
                activeFacets: {},
                dateRange: parseDateRange(),
            };
        }

        return {
            results: searchResults.SearchResult.Data.Records.map((record) =>
                parser(record, domain),
            ),
            totalHits: searchResults.SearchResult.Statistics.TotalHits,
            currentPage:
                searchResults.SearchRequest.RetrievalCriteria.PageNumber,
            maxPage: Math.ceil(
                searchResults.SearchResult.Statistics.TotalHits /
                    searchResults.SearchRequest.RetrievalCriteria
                        .ResultsPerPage,
            ),
            facets: (searchResults.SearchResult.AvailableFacets || []).map(
                (facet) => {
                    if (facet.Id === 'ContentProvider') {
                        return sortFacet(facet, 'HAL');
                    }

                    return sortFacet(facet, null);
                },
            ),
            activeFacets: parseActiveFacets(
                searchResults.SearchRequest.SearchCriteria.FacetFilters,
            ),
            dateRange: parseDateRange(searchResults.SearchResult),
            noFullText: searchResults.noFullText,
        };
    };
}
