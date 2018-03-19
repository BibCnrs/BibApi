import { debugEbscoResult } from 'config';

import retrievePublication from '../../services/retrievePublication';
import retrievePublicationParser from '../../services/retrievePublicationParser';

export const publicationRetrieve = function* articleRetrieve(_, id) {
    try {
        const result = yield retrievePublication(
            id,
            this.domain,
            this.ebscoToken,
        );

        const parsedResult = yield retrievePublicationParser(result);

        if (debugEbscoResult) {
            this.body = {
                ...parsedResult,
                unparsed: result,
            };
            return;
        }

        return parsedResult;
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
