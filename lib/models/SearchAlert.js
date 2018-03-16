import searchAlertQueries from '../queries/searchAlertQueries';

function SearchAlert(client) {
    return client.link(SearchAlert.queries);
}

SearchAlert.queries = searchAlertQueries;

export default SearchAlert;
