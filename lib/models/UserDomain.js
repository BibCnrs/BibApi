import { crud } from 'co-postgres-queries';

const userDomainQueries = crud('bib_user_domain', ['bib_user_id', 'domain_id'], ['bib_user_id', 'domain_id'], ['*'], []);

export default (client) => {

    const queries = userDomainQueries(client);

    queries.assignDomainToUser = function* (domainIds, userId) {
        return yield queries.batchInsert(domainIds.map(domainId => ({ domain_id: domainId, bib_user_id: userId })));
    };

    queries.unassignDomainFromUser = function* (domainIds, userId) {
        return yield queries.batchDelete(domainIds.map(domainId => ({ domain_id: domainId, bib_user_id: userId })));
    };
    return queries;
};
