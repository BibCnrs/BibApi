import { crud } from 'co-postgres-queries';

const userDomainQueries = crud('janus_account_domain', ['janus_account_id', 'domain_id'], ['janus_account_id', 'domain_id'], ['*'], []);

export default (client) => {

    const queries = userDomainQueries(client);

    queries.assignDomainToUser = function* (domainIds, userId) {
        return yield queries.batchInsert(domainIds.map(domainId => ({ domain_id: domainId, janus_account_id: userId })));
    };

    queries.unassignDomainFromUser = function* (domainIds, userId) {
        return yield queries.batchDelete(domainIds.map(domainId => ({ domain_id: domainId, janus_account_id: userId })));
    };
    return queries;
};
