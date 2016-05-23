import { crud } from 'co-postgres-queries';

const userDomainQueries = crud('bib_user_domain', ['bib_user_id', 'domain_id'], ['bib_user_id'], ['*'], []);

export default (client) => {
    return userDomainQueries(client);
};
