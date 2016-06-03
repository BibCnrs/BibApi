import { crud, upsertOne, selectOne, selectPage } from 'co-postgres-queries';

import Domain from './Domain';
import UnitDomain from './UnitDomain';
import entityAssigner from './entityAssigner';
import checkEntityExists from './checkEntityExists';

const selectDomains = (
`SELECT name
FROM domain
JOIN unit_domain ON (domain.id = unit_domain.domain_id)
WHERE unit_domain.unit_id = unit.id ORDER BY name`
);

const fields = [
    'id',
    'code',
    'name',
    'body',
    'building',
    'street',
    'post_office_box',
    'postal_code',
    'town',
    'country',
    'unit_dr',
    'nb_researcher_cnrs',
    'nb_researcher_nocnrs',
    'nb_doctorant',
    'nb_post_doctorant',
    'director_name',
    'director_firstname',
    'director_mail',
    'correspondant_documentaire',
    'cd_phone',
    'cd_mail',
    'correspondant_informatique',
    'ci_phone',
    'ci_mail',
    'comment',
    'nb_unit_account'
];

const unitQueries = crud('unit', fields, ['id'], fields, [
    (queries) => {
        queries.selectOne.returnFields(fields.concat(`ARRAY(${selectDomains}) AS domains`));
        queries.selectPage.returnFields(fields.concat(`ARRAY(${selectDomains}) AS domains`));
    }
]);
const upsertOnePerCodeQuery = upsertOne('unit', ['code'], [
    'code',
    'name',
    'body',
    'building',
    'street',
    'post_office_box',
    'postal_code',
    'town',
    'country',
    'unit_dr',
    'nb_researcher_cnrs',
    'nb_researcher_nocnrs',
    'nb_doctorant',
    'nb_post_doctorant',
    'director_name',
    'director_firstname',
    'director_mail',
    'correspondant_documentaire',
    'cd_phone',
    'cd_mail',
    'correspondant_informatique',
    'ci_phone',
    'ci_mail',
    'nb_unit_account',
    'comment'
]);

const selectOneByCodeQuery = selectOne('unit', ['code'], fields.concat(`ARRAY(${selectDomains}) AS domains`));


const selectByUserIdQuery = selectPage(
    'unit JOIN bib_user_unit ON (unit.id = bib_user_unit.unit_id)',
    ['bib_user_id'],
    ['id', 'bib_user_id', 'code']
);
const selectByIdsQuery = selectPage('unit', ['code'], ['id', 'code']);

export default (client) => {
    const queries = unitQueries(client);
    const domainQueries = Domain(client);
    const unitDomainQueries = UnitDomain(client);
    const baseInsertOne = queries.insertOne;
    const baseUpdateOne = queries.updateOne;

    const selectByUserId = selectByUserIdQuery(client);
    const selectByIds = selectByIdsQuery(client);

    queries.upsertOnePerCode = upsertOnePerCodeQuery(client);
    queries.selectOneByCode = selectOneByCodeQuery(client);

    queries.updateDomains = entityAssigner(
        domainQueries.selectByNames,
        domainQueries.selectByUnitId,
        unitDomainQueries.unassignDomainFromUnit,
        unitDomainQueries.assignDomainToUnit
    );

    queries.insertOne = function* insertOne(unit) {
        try {
            yield client.begin();

            const insertedUnit = yield baseInsertOne(unit);

            const domains = yield queries.updateDomains(unit.domains, insertedUnit.id);

            yield client.commit();

            return {
                ...insertedUnit,
                domains: domains
            };
        } catch (error) {
            yield client.rollback();
            throw error;
        }
    };

    queries.updateOne = function* (selector, unit) {
        try {
            yield client.begin();

            let updatedUnit;
            try {
                updatedUnit = yield baseUpdateOne(selector, unit);
            } catch (error) {
                if(error.message !== 'no valid column to set') {
                    throw error;
                }
                updatedUnit = yield queries.selectOne({ id: selector });
            }

            const domains = yield queries.updateDomains(unit.domains, updatedUnit.id);

            yield client.commit();

            return {
                ...updatedUnit,
                domains
            };
        } catch(error) {
            yield client.rollback();
            throw error;
        }
    };

    queries.selectByIds = function* (ids) {
        const units = yield selectByIds(null, null, { id: ids });
        checkEntityExists('Units', 'id', ids, units);

        return units;
    };

    queries.selectByUserId = function* (userId) {
        return yield selectByUserId(null, null, { bib_user_id: userId }, 'code', 'ASC');
    };

    return queries;
};
