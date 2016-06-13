import { crud, batchUpsert } from 'co-postgres-queries';

const inistAccountDomainQueries = crud('inist_account_domain', ['inist_account_id', 'domain_id', 'index'], ['inist_account_id', 'domain_id'], ['*'], []);
const batchUpsertQuery = batchUpsert('inist_account_domain', ['inist_account_id', 'domain_id'], ['inist_account_id', 'domain_id', 'index']);

export default (client) => {
    const queries = inistAccountDomainQueries(client);
    const batchUpsert = batchUpsertQuery(client);

    queries.assignDomainToInistAccount = function* (domainIds, inistAccountId) {
        return yield batchUpsert(domainIds.map((domainId, index) => ({ domain_id: domainId, inist_account_id: inistAccountId, index })));
    };

    queries.unassignDomainFromInistAccount = function* (domainIds, inistAccountId) {
        return yield queries.batchDelete(domainIds.map(domainId => ({ domain_id: domainId, inist_account_id: inistAccountId })));
    };

    return queries;
};
