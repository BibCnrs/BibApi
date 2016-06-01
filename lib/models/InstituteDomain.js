import { crud } from 'co-postgres-queries';

const instituteDomainQueries = crud('institute_domain', ['institute_id', 'domain_id'], ['institute_id', 'domain_id'], ['*'], []);

export default (client) => {
    const queries = instituteDomainQueries(client);

    queries.assignDomainToInstitute = function* (domainIds, instituteId) {
        return yield queries.batchInsert(domainIds.map(domainId => ({ domain_id: domainId, institute_id: instituteId })));
    };

    queries.unassignDomainFromInstitute = function* (domainIds, instituteId) {
        return yield queries.batchDelete(domainIds.map(domainId => ({ domain_id: domainId, institute_id: instituteId })));
    };

    return queries;
};
