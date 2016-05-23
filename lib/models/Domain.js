import { crud, selectOne, selectPage } from 'co-postgres-queries';

const domainQueries = crud('domain', ['name', 'gate', 'user_id', 'password', 'profile'], ['id'], ['*'], []);
const selectOneByNameQuery = selectOne('domain', ['name'], ['*']);
const selectByNameQuery = selectPage('domain', ['name'], ['id', 'name', 'gate', 'user_id', 'password', 'profile']);

export default (client) => {
    const queries = domainQueries(client);
    const selectOneByName = selectOneByNameQuery(client);
    const selectByName = selectByNameQuery(client);

    queries.selectOneByName = function* (name) {
        const domain =  yield selectOneByName({ name });
        if(!domain) {
            const error = new Error(`Domain ${name} does not exists`);
            error.status = 500;
            throw error;
        }

        return domain;
    };

    queries.selectByName = function* (names) {
        return yield selectByName(null, null, { name: names });
    };

    return queries;
};
