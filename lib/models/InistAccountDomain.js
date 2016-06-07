import { crud } from 'co-postgres-queries';

const inistAccountDomainQueries = crud('inist_account_domain', ['inist_account_id', 'domain_id'], ['inist_account_id', 'domain_id'], ['*'], []);

export default (client) => {
    const queries = inistAccountDomainQueries(client);

    queries.assignDomainToInistAccount = function* (domainIds, inistAccountId) {
        return yield queries.batchInsert(domainIds.map(domainId => ({ domain_id: domainId, inist_account_id: inistAccountId })));
    };

    queries.unassignDomainFromInistAccount = function* (domainIds, inistAccountId) {
        return yield queries.batchDelete(domainIds.map(domainId => ({ domain_id: domainId, inist_account_id: inistAccountId })));
    };

    return queries;
};
