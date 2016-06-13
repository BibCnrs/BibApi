import { crud, batchUpsert } from 'co-postgres-queries';

const unitDomainQueries = crud('unit_domain', ['unit_id', 'domain_id', 'index'], ['unit_id', 'domain_id'], ['*'], []);
const batchUpsertQuery = batchUpsert('unit_domain', ['unit_id', 'domain_id'], ['unit_id', 'domain_id', 'index'], ['unit_id', 'domain_id', 'index']);

export default (client) => {

    const queries = unitDomainQueries(client);
    queries.batchUpsert = batchUpsertQuery(client);

    queries.assignDomainToUnit = function* (domainIds, unitId) {
        return yield queries.batchUpsert(domainIds.map((domainId, index) => ({ domain_id: domainId, unit_id: unitId, index })));
    };

    queries.unassignDomainFromUnit = function* (domainIds, unitId) {
        return yield queries.batchDelete(domainIds.map((domainId) => ({ domain_id: domainId, unit_id: unitId })));
    };

    return queries;
};
