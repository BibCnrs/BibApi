import ebscoArticleSearch from '../../services/ebscoArticleSearch';
import retry from '../../utils/retry';
import searchArticle from '../../services/searchArticle';
import { parseArticleSearch } from '../../services/parseSearchQuery';

export const articleSearch = function* articleSearch(domainName) {
    const query = parseArticleSearch(this.query);

    try {
        this.body = yield retry(searchArticle, [domainName, this.domain, query, this.ebscoToken], 5);
    } catch (error) {
        yield this.ebscoToken.invalidateAuth(domainName);
        if (error.message === 'Max retry reached. Giving up.') {
            this.status = 401;
            this.body = 'Could not connect to ebsco api. Please try again. If the problem persist contact us.';
            return;
        }
        throw error;
    }
};

export const articleSearchPure = function* articleSearchPure(domainName) {
    const { user_id, password, profile } = this.domain;
    const { authToken, sessionToken } = yield this.ebscoToken.get(domainName, user_id, password, profile);
    if (!sessionToken) {
        this.status = 401;
        return;
    }

    const query = parseArticleSearch(this.query);
    try {
        this.body = yield ebscoArticleSearch(query, sessionToken, authToken);
    } catch (error) {
        yield this.ebscoToken.invalidateAuth(domainName);
        throw error;
    }
};
