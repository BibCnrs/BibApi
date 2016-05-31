import { crud } from 'co-postgres-queries';

const unitDomainQueries = crud('unit_domain', ['unit_id', 'domain_id'], ['unit_id', 'domain_id'], ['*'], []);

export default (client) => {
    return unitDomainQueries(client);
};
