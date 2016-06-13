import { crud, batchUpsert } from 'co-postgres-queries';

const userDomainQueries = crud('janus_account_domain', ['janus_account_id', 'domain_id', 'index'], ['janus_account_id', 'domain_id'], ['*'], []);
const batchUpsertQuery = batchUpsert('janus_account_domain', ['janus_account_id', 'domain_id'], ['janus_account_id', 'domain_id', 'index'], ['*']);

export default (client) => {

    const queries = userDomainQueries(client);
    const batchUpsert = batchUpsertQuery(client);

    queries.assignDomainToUser = function* (domainIds, userId) {
        return yield batchUpsert(domainIds.map((domainId, index) => ({ domain_id: domainId, janus_account_id: userId, index })));
    };

    queries.unassignDomainFromUser = function* (domainIds, userId) {
        return yield queries.batchDelete(domainIds.map(domainId => ({ domain_id: domainId, janus_account_id: userId })));
    };
    return queries;
};
