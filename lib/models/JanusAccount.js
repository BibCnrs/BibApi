import { crud, selectOne, upsertOne } from 'co-postgres-queries';
import _ from 'lodash';

import Domain from './Domain';
import Institute from './Institute';
import Unit from './Unit';
import JanusAccountDomain from './JanusAccountDomain';
import JanusAccountInstitute from './JanusAccountInstitute';
import JanusAccountUnit from './JanusAccountUnit';
import entityAssigner from './entityAssigner';

const selectAdditionalInstitutes = (
`SELECT id
FROM institute
JOIN janus_account_institute ON (institute.id = janus_account_institute.institute_id)
WHERE janus_account_institute.janus_account_id = janus_account.id
ORDER BY index ASC`
);

const selectAdditionalUnits = (
`SELECT id
FROM unit
JOIN janus_account_unit ON (unit.id = janus_account_unit.unit_id)
WHERE janus_account_unit.janus_account_id = janus_account.id
ORDER BY index ASC`
);

const selectDomains = (
`SELECT name
FROM domain
JOIN janus_account_domain ON (domain.id = janus_account_domain.domain_id)
WHERE janus_account_domain.janus_account_id = janus_account.id
AND domain.ebsco is true
ORDER BY index ASC`
);

const selectPrimaryInstituteDomains = (
`SELECT domain.name
FROM domain
JOIN institute_domain ON (domain.id = institute_domain.domain_id)
JOIN institute ON (institute_domain.institute_id = institute.id)
WHERE institute.id = janus_account.primary_institute
AND domain.ebsco is true
ORDER BY index ASC`
);

const selectAdditionalInstitutesDomains = (
`SELECT domain.name
FROM domain
JOIN institute_domain ON (domain.id = institute_domain.domain_id)
JOIN institute ON (institute_domain.institute_id = institute.id)
JOIN janus_account_institute ON (institute.id = janus_account_institute.institute_id)
WHERE janus_account_institute.janus_account_id = janus_account.id
AND domain.ebsco is true
ORDER BY janus_account_institute.index ASC, institute_domain.index ASC`
);

const selectPrimaryUnitDomains = (
`SELECT domain.name
FROM domain
JOIN unit_domain ON (domain.id = unit_domain.domain_id)
JOIN unit ON (unit_domain.unit_id = unit.id)
WHERE unit.id = janus_account.primary_unit
AND domain.ebsco is true
ORDER BY index ASC`
);

const selectAdditionalUnitsDomains = (
`SELECT domain.name
FROM domain
JOIN unit_domain ON (domain.id = unit_domain.domain_id)
JOIN unit ON (unit_domain.unit_id = unit.id)
JOIN janus_account_unit ON (unit.id = janus_account_unit.unit_id)
WHERE janus_account_unit.janus_account_id = janus_account.id
AND domain.ebsco is true
ORDER BY janus_account_unit.index ASC, unit_domain.index ASC`
);

const selectPrimaryUnitInstitutesDomains = (
`SELECT domain.name
FROM domain
JOIN institute_domain ON (domain.id = institute_domain.domain_id)
JOIN unit_institute ON (unit_institute.institute_id = institute_domain.institute_id)
WHERE unit_institute.unit_id = janus_account.primary_unit
AND domain.ebsco is true
ORDER BY unit_institute.index ASC, institute_domain.index ASC`
);

const selectAdditionalUnitsInstitutesDomains = (
`SELECT domain.name
FROM domain
JOIN institute_domain ON (domain.id = institute_domain.domain_id)
JOIN unit_institute ON (unit_institute.institute_id = institute_domain.institute_id)
JOIN janus_account_unit ON (janus_account_unit.unit_id = unit_institute.unit_id)
WHERE janus_account_unit.janus_account_id = janus_account.id
AND domain.ebsco is true
ORDER BY janus_account_unit.index ASC, unit_institute.index ASC, institute_domain.index ASC`
);

const returnFields = [
    'id',
    'username',
    'primary_institute',
    `ARRAY(${selectPrimaryInstituteDomains}) as primary_institute_domains`,
    `ARRAY(${selectAdditionalInstitutes}) AS additional_institutes`,
    `ARRAY(${selectAdditionalInstitutesDomains}) as additional_institutes_domains`,
    'primary_unit',
    `ARRAY(${selectPrimaryUnitDomains}) as primary_unit_domains`,
    `ARRAY(${selectAdditionalUnits}) AS additional_units`,
    `ARRAY(${selectAdditionalUnitsDomains}) as additional_units_domains`,
    `ARRAY(${selectPrimaryUnitInstitutesDomains}) as primary_unit_institutes_domains`,
    `ARRAY(${selectAdditionalUnitsInstitutesDomains}) as additional_units_institutes_domains`,
    `ARRAY(${selectDomains}) AS domains`
];

const janusAccountQueries = crud('janus_account', ['username', 'primary_institute', 'primary_unit'], ['id'], [
    'id',
    'username',
    'primary_institute',
    'primary_unit'
], [
    (queries) => {
        queries.selectOne.returnFields(returnFields);

        queries.selectPage
        .table(
`janus_account
LEFT JOIN janus_account_unit ON janus_account_unit.janus_account_id = janus_account.id
LEFT JOIN unit ON (unit.id = janus_account_unit.unit_id) OR (unit.id = janus_account.primary_unit)

LEFT JOIN janus_account_institute ON janus_account_institute.janus_account_id = janus_account.id
LEFT JOIN unit_institute ON unit_institute.unit_id = unit.id
LEFT JOIN institute ON (institute.id = janus_account_institute.institute_id) OR (institute.id = unit_institute.institute_id) OR (institute.id = janus_account.primary_institute)

LEFT JOIN janus_account_domain ON janus_account_domain.janus_account_id = janus_account.id
LEFT JOIN unit_domain ON unit_domain.unit_id = unit.id
LEFT JOIN institute_domain ON (institute_domain.institute_id = institute.id)
LEFT JOIN domain ON (domain.id = janus_account_domain.domain_id) OR (domain.id = unit_domain.domain_id) OR (domain.id = institute_domain.domain_id)`
        )
        .groupByFields([
            'janus_account.id',
            'janus_account.username',
            'janus_account.primary_institute',
            'janus_account.primary_unit'
        ])
        .returnFields(returnFields.map(field => {
            if(field.match(/ARRAY/)) {
                return field;
            }

            return `janus_account.${field}`;
        }))
        .searchableFields([
            'janus_account.id',
            'janus_account.username',
            'janus_account.primary_institute',
            'janus_account.primary_unit',
            'domain.name',
            'unit.id',
            'institute.id'
        ]);

    }
]);
const upsertOnePerUsernameQuery = upsertOne('janus_account', ['username'], ['primary_institute', 'primary_unit'], ['id', 'username', 'primary_institute', 'primary_unit']);
const selectOneByUsernameQuery = selectOne('janus_account', ['username'], returnFields);

export const addAllDomains = (janusAccount) => {
    return {
        ...janusAccount,
        all_domains: _.uniq(
            janusAccount.primary_institute_domains
            .concat(janusAccount.additional_institutes_domains)
            .concat(janusAccount.primary_unit_domains)
            .concat(janusAccount.primary_unit_institutes_domains)
            .concat(janusAccount.additional_units_domains)
            .concat(janusAccount.additional_units_institutes_domains)
            .concat(janusAccount.domains)
        )
    };
};

export default (client) => {
    const domainQueries = Domain(client);
    const instituteQueries = Institute(client);
    const unitQueries = Unit(client);
    const janusAccountInstituteQueries = JanusAccountInstitute(client);
    const janusAccountUnitQueries = JanusAccountUnit(client);
    const queries = janusAccountQueries(client);

    const baseSelectOne = queries.selectOne;
    const baseSelectPage = queries.selectPage;
    const baseUpdateOne = queries.updateOne;
    const baseInsertOne = queries.insertOne;
    const janusAccountDomainQueries = JanusAccountDomain(client);

    queries.upsertOnePerUsername = upsertOnePerUsernameQuery(client);
    const baseSelectOneByUsername = selectOneByUsernameQuery(client);

    queries.updateDomains = entityAssigner(
        domainQueries.selectByNames,
        domainQueries.selectByJanusAccountId,
        janusAccountDomainQueries.unassignDomainFromUser,
        janusAccountDomainQueries.assignDomainToUser
    );

    queries.updateAdditionalInstitutes = entityAssigner(
        instituteQueries.selectByIds,
        instituteQueries.selectByJanusAccountId,
        janusAccountInstituteQueries.unassignInstituteFromUser,
        janusAccountInstituteQueries.assignInstituteToUser
    );

    queries.updateAdditionalUnits = entityAssigner(
        unitQueries.selectByIds,
        unitQueries.selectByJanusAccountId,
        janusAccountUnitQueries.unassignUnitFromUser,
        janusAccountUnitQueries.assignUnitToUser
    );

    queries.selectOneByUsername = function* (...args) {
        const janusAccount = yield baseSelectOneByUsername(...args);

        return addAllDomains(janusAccount);
    };

    queries.selectOne = function* (...args) {
        const janusAccount = yield baseSelectOne(...args);

        return addAllDomains(janusAccount);
    };

    queries.selectPage = function* (...args) {
        const janusAccounts = yield baseSelectPage(...args);

        return janusAccounts.map(addAllDomains);
    };

    queries.insertOne = function* insertOne(janusAccount) {
        try {
            yield client.begin();
            const insertedUser = yield baseInsertOne(janusAccount);

            const domains = yield queries.updateDomains(janusAccount.domains, insertedUser.id);
            const additional_institutes = yield queries.updateAdditionalInstitutes(janusAccount.additional_institutes, insertedUser.id);
            const additional_units = yield queries.updateAdditionalUnits(janusAccount.additional_units, insertedUser.id);

            yield client.commit();

            return {
                ...insertedUser,
                domains,
                additional_institutes,
                additional_units
            };
        } catch (error) {
            yield client.rollback();
            throw error;
        }
    };

    queries.updateOne = function* (selector, janusAccount) {
        try {
            yield client.begin();

            let updatedUser;
            try {
                updatedUser = yield baseUpdateOne(selector, janusAccount);
            } catch (error) {
                if(error.message !== 'no valid column to set') {
                    throw error;
                }
                updatedUser = yield queries.selectOne({ id: selector });
            }
            const domains = yield queries.updateDomains(janusAccount.domains, updatedUser.id);
            const additional_institutes = yield queries.updateAdditionalInstitutes(janusAccount.additional_institutes, updatedUser.id);
            const additional_units = yield queries.updateAdditionalUnits(janusAccount.additional_units, updatedUser.id);

            yield client.commit();

            return {
                ...updatedUser,
                domains,
                additional_institutes,
                additional_units
            };
        } catch (error) {
            yield client.rollback();
            throw error;
        }
    };

    return queries;
};
