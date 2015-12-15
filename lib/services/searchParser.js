import resultParser from './resultParser';

export default function (searchResults) {
    return searchResults.SearchResult.Data.Records.map(resultParser);
}
