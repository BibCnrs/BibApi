import { debugEbscoResult } from 'config';
import searchArticle from '../../services/searchArticle';
import { parseArticleSearch } from '../../services/parseSearchQuery';
import searchArticleParser from '../../services/searchArticleParser';

export const articleSearch = function* articleSearch() {
    const query = parseArticleSearch(this.query);

    try {
        const result = yield searchArticle(this.domain, query, this.ebscoToken);
        const parsedResult = yield searchArticleParser(result);
        if (debugEbscoResult) {
            this.body = {
                ...parsedResult,
                unparsed: result,
            };
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
