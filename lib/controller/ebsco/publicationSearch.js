import ebscoPublicationSearch from '../../services/ebscoPublicationSearch';
import retry from '../../utils/retry';
import searchPublication from '../../services/searchPublication';

export const publicationSearch = function* publicationSearch(domainName) {
    const query = {
        ...this.query,
        activeFacets: this.query.activeFacets ? JSON.parse(decodeURIComponent(this.query.activeFacets)) : null,
        queries: this.query.queries ? JSON.parse(decodeURIComponent(this.query.queries)) : null
    };
    if (query.queries.length === 1) {
        const { term, field } = query.queries[0];
        if(field === 'TI') {
            if (term.match(/[A-Z]\*$/)) {
                query.queries = [{
                    term: `JN ${term} OR (TI (${term.slice(0, -1)}) AND (PT book OR PT ebook))`,
                    field: null,
                    boolean: 'AND',
                }];
            }

            if (term === '0* OR 1* OR 2* OR 3* OR 4* OR 5* OR 6* OR 7* OR 8* OR 9*') {
                query.queries = [{
                    term: `JN (${term}) OR (TI (${term}) AND (PT book OR PT ebook))`,
                    field: null,
                    boolean: 'AND',
                }];
            }
        }
    }

    try {
        this.body = yield retry(searchPublication, [domainName, query, this.domain, this.ebscoToken], 5);
    } catch(error) {
        yield this.ebscoToken.invalidateAuth(domainName);
        if (error.message === 'Max retry reached. Giving up.') {
            this.status = 401;
            this.body = 'Could not connect to ebsco api. Please try again. If the problem persist contact us.';
            return;
        }
        throw error;
    }
};

export const publicationSearchPure = function* publicationSearchPure(domainName) {
    const { user_id, password, profile } = this.domain;
    const { authToken, sessionToken} = yield this.ebscoToken.get(domainName, user_id, password, profile);
    if (!sessionToken) {
        this.status = 401;
        return;
    }
    this.query.queries = JSON.parse(decodeURIComponent(this.query.queries));
    this.query.activeFacets = this.query.activeFacets && JSON.parse(decodeURIComponent(this.query.activeFacets));
    try {
        this.body = yield ebscoPublicationSearch(this.query, sessionToken, authToken);
    } catch (error) {
        yield this.ebscoToken.invalidateSession(domainName);
        throw error;
    }
};
