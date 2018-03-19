import { debugEbscoResult } from 'config';

import retrieveArticle from '../../services/retrieveArticle';
import retrieveArticleParser from '../../services/retrieveArticleParser';

export const articleRetrieve = function* articleRetrieve(domainName, dbId, an) {
    try {
        const result = yield retrieveArticle(
            domainName,
            this.domain,
            dbId,
            an,
            this.ebscoToken,
        );

        const parsedResult = yield retrieveArticleParser(result);

        if (debugEbscoResult) {
            this.body = {
                ...parsedResult,
                unparsed: result,
            };
            return;
        }

        this.body = parsedResult;
    } catch (error) {
        yield this.ebscoToken.invalidateAuth(domainName);
        if (error.message === 'Max retry reached. Giving up.') {
            this.status = 401;
            this.body =
                'Could not connect to ebsco api. Please try again. If the problem persist contact us.';
            return;
        }
        throw error;
    }
};
