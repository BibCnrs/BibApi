import {ebsco} from 'config';
import resultParser from './resultParser';

export default function (searchResults) {
    return {
        results: searchResults.SearchResult.Data.Records.map(resultParser),
        currentPage: searchResults.SearchRequest.RetrievalCriteria.PageNumber,
        maxPage: Math.ceil(searchResults.SearchResult.Statistics.TotalHits / ebsco.resultsPerPage)
    };
}
