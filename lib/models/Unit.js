import { crud, upsertOne, batchUpsert, selectOne, selectPage } from 'co-postgres-queries';

import Domain from './Domain';
import Institute from './Institute';
import UnitDomain from './UnitDomain';
import UnitInstitute from './UnitInstitute';
import entityAssigner from './entityAssigner';
import checkEntityExists from './checkEntityExists';

const selectDomains = (
`SELECT name
FROM domain
JOIN unit_domain ON (domain.id = unit_domain.domain_id)
WHERE unit_domain.unit_id = unit.id
ORDER BY index ASC`
);

const selectInstitutes = (
`SELECT id
FROM institute
JOIN unit_institute ON (institute.id = unit_institute.institute_id)
WHERE unit_institute.unit_id = unit.id
ORDER BY index ASC`
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
        queries.selectOne.returnFields(fields.concat([
            `ARRAY(${selectDomains}) AS domains`,
            `ARRAY(${selectInstitutes}) AS institutes`
        ]));
        queries.selectPage.returnFields(fields.concat([
            `ARRAY(${selectDomains}) AS domains`,
            `ARRAY(${selectInstitutes}) AS institutes`
        ]));
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

const batchUpsertPerCodeQuery = batchUpsert('unit', ['code'], [
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
const selectIdByNameQuery = selectPage('unit', ['name'], ['id']);

const selectByJanusAccountIdQuery = selectPage(
    'unit JOIN janus_account_unit ON (unit.id = janus_account_unit.unit_id)',
    ['janus_account_id'],
    ['id', 'janus_account_id', 'code']
);

const selectByInistAccountIdQuery = selectPage(
    'unit JOIN inist_account_unit ON (unit.id = inist_account_unit.unit_id)',
    ['inist_account_id'],
    ['id', 'inist_account_id', 'code']
);

const selectByQuery = selectPage('unit', ['code'], ['id', 'code']);

export default (client) => {
    const queries = unitQueries(client);
    const domainQueries = Domain(client);
    const instituteQueries = Institute(client);
    const unitDomainQueries = UnitDomain(client);
    const unitInstituteQueries = UnitInstitute(client);
    const baseInsertOne = queries.insertOne;
    const baseUpdateOne = queries.updateOne;

    const selectByJanusAccountId = selectByJanusAccountIdQuery(client);
    const selectByInistAccountId = selectByInistAccountIdQuery(client);
    const selectBy = selectByQuery(client);

    queries.upsertOnePerCode = upsertOnePerCodeQuery(client);
    queries.batchUpsertPerCode = batchUpsertPerCodeQuery(client);
    queries.selectOneByCode = selectOneByCodeQuery(client);

    queries.updateDomains = entityAssigner(
        domainQueries.selectByNames,
        domainQueries.selectByUnitId,
        unitDomainQueries.unassignDomainFromUnit,
        unitDomainQueries.assignDomainToUnit
    );

    queries.updateInstitutes = entityAssigner(
        instituteQueries.selectByIds,
        instituteQueries.selectByUnitId,
        unitInstituteQueries.unassignInstituteFromUnit,
        unitInstituteQueries.assignInstituteToUnit
    );

    queries.insertOne = function* insertOne(unit) {
        try {
            yield client.begin();

            const insertedUnit = yield baseInsertOne(unit);

            const domains = yield queries.updateDomains(unit.domains, insertedUnit.id);
            const institutes = yield queries.updateInstitutes(unit.institutes, insertedUnit.id);

            yield client.commit();

            return {
                ...insertedUnit,
                domains,
                institutes
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
            const institutes = yield queries.updateInstitutes(unit.institutes, updatedUnit.id);

            yield client.commit();

            return {
                ...updatedUnit,
                domains,
                institutes
            };
        } catch(error) {
            yield client.rollback();
            throw error;
        }
    };

    queries.selectByIds = function* (ids) {
        const units = yield selectBy(null, null, { id: ids });
        checkEntityExists('Units', 'id', ids, units);

        return units;
    };

    queries.selectByCodes = function* (codes) {
        const units = yield selectBy(null, null, { code: codes });
        checkEntityExists('Units', 'id', codes, units);

        return units;
    };

    queries.selectByJanusAccountId = function* (userId) {
        return yield selectByJanusAccountId(null, null, { janus_account_id: userId }, 'code', 'ASC');
    };

    queries.selectByInistAccountId = function* (inistAccountId) {
        return yield selectByInistAccountId(null, null, { inist_account_id: inistAccountId }, 'code', 'ASC');
    };

    return queries;
};
