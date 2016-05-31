import { crud } from 'co-postgres-queries';

const instituteDomainQueries = crud('institute_domain', ['institute_id', 'domain_id'], ['institute_id', 'domain_id'], ['*'], []);

export default (client) => {
    return instituteDomainQueries(client);
};
