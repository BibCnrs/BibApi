import { debugEbscoResult } from 'config';

import searchPublication from '../../services/searchPublication';
import searchPublicationParser from '../../services/searchPublicationParser';
import { parsePublicationSearch } from '../../services/parseSearchQuery';

export const publicationSearch = function* publicationSearch() {
    const query = parsePublicationSearch(this.query);

    try {
        const result = yield searchPublication(
            this.domain,
            this.ebscoToken,
        )(query);
        const parsedResult = yield searchPublicationParser(
            result,
            this.domain.name,
        );

        if (debugEbscoResult) {
            this.body = {
                ...parsedResult,
                unparsed: result,
            };
            return;
        }
        this.body = parsedResult;
    } catch (error) {
        yield this.ebscoToken.invalidateAuth(this.domain.name);
        if (error.message === 'Max retry reached. Giving up.') {
            this.status = 401;
            this.body =
                'Could not connect to ebsco api. Please try again. If the problem persist contact us.';
            return;
        }
        throw error;
    }
};
