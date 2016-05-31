import { crud, selectOne, selectPage } from 'co-postgres-queries';

const domainQueries = crud('domain', ['name', 'gate', 'user_id', 'password', 'profile'], ['id'], ['*'], []);
const selectOneByNameQuery = selectOne('domain', ['name'], ['*']);
const selectOneByGateQuery = selectOne('domain', ['gate'], ['*']);
const selectByNameQuery = selectPage('domain', ['name'], ['id', 'name', 'gate', 'user_id', 'password', 'profile']);
const selectByUserQuery = selectPage(
    'domain JOIN bib_user_domain ON (domain.id = bib_user_domain.domain_id)',
    ['bib_user_id'],
    ['id', 'bib_user_id', 'name', 'gate', 'user_id', 'password', 'profile']
);
const selectByInstituteQuery = selectPage(
    'domain JOIN institute_domain ON (domain.id = institute_domain.domain_id)',
    ['institute_id'],
    ['id', 'institute_id', 'name', 'gate', 'user_id', 'password', 'profile']
);

export default (client) => {
    const queries = domainQueries(client);
    const selectOneByName = selectOneByNameQuery(client);
    const selectByName = selectByNameQuery(client);
    const selectByUser = selectByUserQuery(client);
    const selectByInstitute = selectByInstituteQuery(client);

    queries.selectOneByName = function* (name) {
        const domain =  yield selectOneByName({ name });
        if(!domain) {
            const error = new Error(`Domain ${name} does not exists`);
            error.status = 500;
            throw error;
        }

        return domain;
    };

    queries.selectOneByGate = selectOneByGateQuery(client);

    queries.selectByName = function* (names) {
        return yield selectByName(null, null, { name: names });
    };

    queries.selectByUser = function* (user) {
        return yield selectByUser(null, null, { bib_user_id: user.id }, 'name', 'ASC');
    };

    queries.selectByInstitute = function* (institute) {
        return yield selectByInstitute(null, null, { institute_id: institute.id }, 'name', 'ASC');
    };

    return queries;
};
