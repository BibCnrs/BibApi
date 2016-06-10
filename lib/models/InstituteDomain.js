import { crud, batchUpsert } from 'co-postgres-queries';

const instituteDomainQueries = crud('institute_domain', ['institute_id', 'domain_id', 'index'], ['institute_id', 'domain_id'], ['*'], []);
const batchUpsertQuery = batchUpsert('institute_domain', ['institute_id', 'domain_id'], ['institute_id', 'domain_id', 'index'], ['institute_id', 'domain_id', 'index']);

export default (client) => {
    const queries = instituteDomainQueries(client);
    const batchUpsert = batchUpsertQuery(client);

    queries.assignDomainToInstitute = function* (domainIds, instituteId) {
        return yield batchUpsert(domainIds.map((domainId, index) => ({ domain_id: domainId, institute_id: instituteId, index })));
    };

    queries.unassignDomainFromInstitute = function* (domainIds, instituteId) {
        return yield queries.batchDelete(domainIds.map((domainId) => ({ domain_id: domainId, institute_id: instituteId })));
    };

    return queries;
};
