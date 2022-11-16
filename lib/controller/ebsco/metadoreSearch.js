import { parseMetadoreSearch } from '../../services/parseSearchQuery';
import metadoreRequest from '../../services/metadoreRequest';
import metadoreResultsParser from '../../services/metadoreResultsParser';

export const metadoreSearch = function* metadoreSearch() {
    try {
        const queryString = parseMetadoreSearch(this.query);
        const result = yield metadoreRequest(queryString);
        const parsedResult = metadoreResultsParser(result);
        this.body = parsedResult;
    } catch (error) {
        if (error.statusCode && error.message) {
            this.status = error.statusCode;
            this.body = error.message;
            return;
        }
        throw error;
    }
};
