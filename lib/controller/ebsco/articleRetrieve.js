import { debugEbscoResult } from 'config';

import retrieveArticle from '../../services/retrieveArticle';
import retrieveArticleParser from '../../services/retrieveArticleParser';

export const articleRetrieve = function* articleRetrieve() {
    const { dbid, an } = this.query;
    try {
        const result = yield retrieveArticle(this.domain, this.ebscoToken)(
            dbid,
            an,
        );

        const parsedResult = yield retrieveArticleParser(
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
