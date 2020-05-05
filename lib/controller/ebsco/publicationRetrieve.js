import { debugEbscoResult } from 'config';

import retrievePublication from '../../services/retrievePublication';
import retrievePublicationParser from '../../services/retrievePublicationParser';

export const publicationRetrieve = function* publicationRetrieve(_, id) {
    try {
        const result = yield retrievePublication(
            this.domain,
            this.ebscoToken,
        )(id);

        const parsedResult = yield retrievePublicationParser(result);

        if (debugEbscoResult) {
            this.body = {
                ...parsedResult,
                unparsed: result,
            };
            return;
        }

        this.body = parsedResult;
    } catch (error) {
        if (error.message === 'Max retry reached. Giving up.') {
            this.status = 401;
            this.body =
                'Could not connect to ebsco api. Please try again. If the problem persist contact us.';
            return;
        }
        throw error;
    }
};
