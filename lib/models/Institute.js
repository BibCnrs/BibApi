import { crud, selectOne, selectPage, upsertOne } from 'co-postgres-queries';

import Domain from './Domain';
import InstituteDomain from './InstituteDomain';
import checkEntityExists from './checkEntityExists';
import entityAssigner from './entityAssigner';

const selectDomains = (
`SELECT name
FROM domain
JOIN institute_domain ON (domain.id = institute_domain.domain_id)
WHERE institute_domain.institute_id = institute.id ORDER BY name`);

const instituteQueries = crud('institute', ['code', 'name'], ['id'], ['*'], [
    (queries) => {
        queries.selectOne.returnFields([
            'id',
            'code',
            'name',
            `ARRAY(${selectDomains}) AS domains`
        ]);
        queries.selectPage.returnFields([
            'id',
            'code',
            'name',
            `ARRAY(${selectDomains}) AS domains`
        ]);
    }
]);

const selectByUserIdQuery = selectPage(
    'institute JOIN bib_user_institute ON (institute.id = bib_user_institute.institute_id)',
    ['bib_user_id'],
    ['id', 'bib_user_id', 'code', 'name']
);

const selectByIdsQuery = selectPage('institute', ['name'], ['id', 'code', 'name']);

const upsertOnePerCodeQuery = upsertOne('institute', ['code'], ['name']);
const selectOneByCodeQuery = selectOne('institute', ['code'], ['id', 'code', 'name', `ARRAY(${selectDomains}) AS domains`]);

export default (client) => {
    const queries = instituteQueries(client);
    const domainQueries = Domain(client);
    const instituteDomainQueries = InstituteDomain(client);
    const baseInsertOne = queries.insertOne;
    const baseUpdateOne = queries.updateOne;
    const selectByUserId = selectByUserIdQuery(client);
    const selectByIds = selectByIdsQuery(client);

    queries.upsertOnePerCode = upsertOnePerCodeQuery(client);
    queries.selectOneByCode = selectOneByCodeQuery(client);

    queries.selectByUserId = function* (userId) {
        return yield selectByUserId(null, null, { bib_user_id: userId }, 'code', 'ASC');
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
        const institutes = yield selectByIds(null, null, { id: ids });
        checkEntityExists('Institutes', 'id', ids, institutes);

        return institutes;
    };

    return queries;
};
