import { crud } from 'co-postgres-queries';

const unitDomainQueries = crud('unit_domain', ['unit_id', 'domain_id'], ['unit_id', 'domain_id'], ['*'], []);

export default (client) => {

    const queries = unitDomainQueries(client);

    queries.assignDomainToUnit = function* (domainIds, unitId) {
        return yield queries.batchInsert(domainIds.map(domainId => ({ domain_id: domainId, unit_id: unitId })));
    };

    queries.unassignDomainFromUnit = function* (domainIds, unitId) {
        return yield queries.batchDelete(domainIds.map(domainId => ({ domain_id: domainId, unit_id: unitId })));
    };

    return queries;
};
