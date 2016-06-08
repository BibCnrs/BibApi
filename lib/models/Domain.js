import { crud, selectOne, selectPage } from 'co-postgres-queries';

import checkEntityExists from './checkEntityExists';

const domainQueries = crud('domain', ['name', 'gate', 'user_id', 'password', 'profile'], ['name'], ['*'], []);
const selectOneByNameQuery = selectOne('domain', ['name'], ['*']);
const selectOneByGateQuery = selectOne('domain', ['gate'], ['*']);
const selectByNameQuery = selectPage('domain', ['name'], ['id', 'name', 'gate', 'user_id', 'password', 'profile']);

const selectByJanusAccountIdQuery = selectPage(
    'domain JOIN janus_account_domain ON (domain.id = janus_account_domain.domain_id)',
    ['janus_account_id'],
    ['id', 'janus_account_id', 'name', 'gate', 'user_id', 'password', 'profile']
);
const selectByInistAccountIdQuery = selectPage(
    'domain JOIN inist_account_domain ON (domain.id = inist_account_domain.domain_id)',
    ['inist_account_id'],
    ['id', 'inist_account_id', 'name', 'gate', 'user_id', 'password', 'profile']
);
const selectByInstituteIdQuery = selectPage(
    'domain JOIN institute_domain ON (domain.id = institute_domain.domain_id)',
    ['institute_id'],
    ['id', 'institute_id', 'name', 'gate', 'user_id', 'password', 'profile']
);
const selectByUnitIdQuery = selectPage(
    'domain JOIN unit_domain ON (domain.id = unit_domain.domain_id)',
    ['unit_id'],
    ['id', 'unit_id', 'name', 'gate', 'user_id', 'password', 'profile']
);

export default (client) => {
    const queries = domainQueries(client);
    const selectOneByName = selectOneByNameQuery(client);
    const selectByName = selectByNameQuery(client);
    const selectByJanusAccountId = selectByJanusAccountIdQuery(client);
    const selectByInistAccountId = selectByInistAccountIdQuery(client);
    const selectByInstituteId = selectByInstituteIdQuery(client);
    const selectByUnitId = selectByUnitIdQuery(client);

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

    queries.selectByNames = function* (names) {
        const domains = yield selectByName(null, null, { name: names });
        checkEntityExists('Domains', 'name', names, domains);

        return domains;
    };

    queries.selectByJanusAccountId = function* (userId) {
        return yield selectByJanusAccountId(null, null, { janus_account_id: userId }, 'name', 'ASC');
    };

    queries.selectByInistAccountId = function* (inistAccountId) {
        return yield selectByInistAccountId(null, null, { inist_account_id: inistAccountId }, 'name', 'ASC');
    };

    queries.selectByInstituteId = function* (instituteId) {
        return yield selectByInstituteId(null, null, { institute_id: instituteId }, 'name', 'ASC');
    };

    queries.selectByUnitId = function* (unitId) {
        return yield selectByUnitId(null, null, { unit_id: unitId }, 'name', 'ASC');
    };

    return queries;
};
