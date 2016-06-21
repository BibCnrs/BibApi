import { crud, selectOne, selectPage, selectByOrderedFieldValues, upsertOne } from 'co-postgres-queries';

import Domain from './Domain';
import InstituteDomain from './InstituteDomain';
import checkEntityExists from './checkEntityExists';
import entityAssigner from './entityAssigner';

const selectDomains = (
`SELECT name
FROM domain
JOIN institute_domain ON (domain.id = institute_domain.domain_id)
WHERE institute_domain.institute_id = institute.id
ORDER BY index ASC`);

const instituteQueries = crud('institute', ['code', 'name'], ['id'], ['id', 'code', 'name'], [
    (queries) => {
        queries.selectOne.returnFields([
            'id',
            'code',
            'name',
            `ARRAY(${selectDomains}) AS domains`
        ]);

        queries.selectPage
        .table(
`institute
LEFT JOIN institute_domain ON institute_domain.institute_id = institute.id
LEFT JOIN domain ON domain.id = institute_domain.domain_id`
        )
        .groupByFields([
            'institute.id',
            'institute.code',
            'institute.name'
        ])
        .searchableFields([
            'institute.id',
            'institute.code',
            'institute.name',
            'domain.name'
        ])
        .returnFields([
            'institute.id',
            'institute.code',
            'institute.name',
            `ARRAY(${selectDomains}) AS domains`
        ]);
    }
]);

const selectByJanusAccountIdQuery = selectPage(
    'institute JOIN janus_account_institute ON (institute.id = janus_account_institute.institute_id)',
    ['janus_account_id'],
    ['id', 'janus_account_id', 'code', 'name', 'index']
);

const selectByInistAccountIdQuery = selectPage(
    'institute JOIN inist_account_institute ON (institute.id = inist_account_institute.institute_id)',
    ['inist_account_id'],
    ['id', 'inist_account_id', 'code', 'name', 'index']
);

const selectByUnitIdQuery = selectPage(
    'institute JOIN unit_institute ON (institute.id = unit_institute.institute_id)',
    ['unit_id'],
    ['id', 'unit_id', 'code', 'name', 'index']
);

const selectByQuery = selectPage('institute', ['name'], ['id', 'code', 'name']);
const selectByIdsQuery = selectByOrderedFieldValues('institute', 'id', ['id', 'code', 'name']);

const upsertOnePerCodeQuery = upsertOne('institute', ['code'], ['name']);
const selectOneByCodeQuery = selectOne('institute', ['code'], ['id', 'code', 'name', `ARRAY(${selectDomains}) AS domains`]);

export default (client) => {
    const queries = instituteQueries(client);
    const domainQueries = Domain(client);
    const instituteDomainQueries = InstituteDomain(client);
    const baseInsertOne = queries.insertOne;
    const baseUpdateOne = queries.updateOne;
    const selectByJanusAccountId = selectByJanusAccountIdQuery(client);
    const selectByInistAccountId = selectByInistAccountIdQuery(client);
    const selectByUnitId = selectByUnitIdQuery(client);
    const selectBy = selectByQuery(client);
    const selectByIds = selectByIdsQuery(client);

    queries.upsertOnePerCode = upsertOnePerCodeQuery(client);
    queries.selectOneByCode = selectOneByCodeQuery(client);

    queries.selectByJanusAccountId = function* (userId) {
        return yield selectByJanusAccountId(null, null, { janus_account_id: userId }, 'index', 'ASC');
    };

    queries.selectByInistAccountId = function* (inistAccountId) {
        return yield selectByInistAccountId(null, null, { inist_account_id: inistAccountId }, 'index', 'ASC');
    };

    queries.selectByUnitId = function* (unitId) {
        return yield selectByUnitId(null, null, { unit_id: unitId }, 'index', 'ASC');
    };

    queries.updateDomains = entityAssigner(
        domainQueries.selectByNames,
        domainQueries.selectByInstituteId,
        instituteDomainQueries.unassignDomainFromInstitute,
        instituteDomainQueries.assignDomainToInstitute
    );

    queries.insertOne = function* insertOne(institute) {
        try {
            yield client.begin();
            const insertedInstitute = yield baseInsertOne(institute);

            const domains = yield queries.updateDomains(institute.domains, insertedInstitute.id);

            yield client.commit();

            return {
                ...insertedInstitute,
                domains: domains
            };
        } catch (error) {
            yield client.rollback();
            throw error;
        }
    };

    queries.updateOne = function* (selector, institute) {
        try {
            yield client.begin();

            let updatedInstitute;
            try {
                updatedInstitute = yield baseUpdateOne(selector, institute);
            } catch (error) {
                if(error.message !== 'no valid column to set') {
                    throw error;
                }
                updatedInstitute = yield queries.selectOne({ id: selector });
            }

            const domains = yield queries.updateDomains(institute.domains, updatedInstitute.id);

            yield client.commit();

            return {
                ...updatedInstitute,
                domains
            };
        } catch(error) {
            yield client.rollback();
            throw error;
        }
    };

    queries.selectByIds = function* (ids) {
        const institutes = yield selectByIds(ids);
        checkEntityExists('Institutes', 'id', ids, institutes);

        return institutes;
    };

    queries.selectByCodes = function* (codes) {
        const institutes = yield selectBy(null, null, { code: codes });
        checkEntityExists('Institutes', 'code', codes, institutes);

        return institutes;
    };

    return queries;
};
