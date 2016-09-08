import { crud, selectOne, batchUpsert } from 'co-postgres-queries';

import Domain from './Domain';
import Institute from './Institute';
import Unit from './Unit';
import InistAccountDomain from './InistAccountDomain';
import InistAccountInstitute from './InistAccountInstitute';
import InistAccountUnit from './InistAccountUnit';
import entityAssigner from './entityAssigner';
import _ from 'lodash';

const selectInstitutes = (
`SELECT id
FROM institute
JOIN inist_account_institute ON (institute.id = inist_account_institute.institute_id)
WHERE inist_account_institute.inist_account_id = inist_account.id
ORDER BY index ASC`
);

const selectMainInstituteCode = (
`SELECT code
FROM institute
WHERE inist_account.main_institute = institute.id`
);

const selectUnits = (
`SELECT id
FROM unit
JOIN inist_account_unit ON (unit.id = inist_account_unit.unit_id)
WHERE inist_account_unit.inist_account_id = inist_account.id
ORDER BY index ASC`
);

const selectMainUnitCode = (
`SELECT code
FROM unit
WHERE inist_account.main_unit = unit.id`
);

const selectDomains = (
`SELECT name
FROM domain
JOIN inist_account_domain ON (domain.id = inist_account_domain.domain_id)
WHERE inist_account_domain.inist_account_id = inist_account.id
AND domain.ebsco is true
ORDER BY index ASC`
);

const selectGroups = (
`SELECT gate
FROM domain
JOIN inist_account_domain ON (domain.id = inist_account_domain.domain_id)
WHERE inist_account_domain.inist_account_id = inist_account.id
ORDER BY index ASC`
);

const selectMainInstituteDomains = (
`SELECT domain.name
FROM domain
JOIN institute_domain ON (domain.id = institute_domain.domain_id)
WHERE institute_domain.institute_id = inist_account.main_institute
AND domain.ebsco is true
ORDER BY institute_domain.index ASC`
);

const selectMainInstituteGroups = (
`SELECT domain.gate
FROM domain
JOIN institute_domain ON (domain.id = institute_domain.domain_id)
WHERE institute_domain.institute_id = inist_account.main_institute
AND domain.ebsco is true
ORDER BY institute_domain.index ASC`
);

const selectMainUnitDomains = (
`SELECT domain.name
FROM domain
JOIN unit_domain ON (domain.id = unit_domain.domain_id)
WHERE unit_domain.unit_id = inist_account.main_unit
AND domain.ebsco is true
ORDER BY unit_domain.index ASC`
);

const selectMainUnitGroups = (
`SELECT domain.gate
FROM domain
JOIN unit_domain ON (domain.id = unit_domain.domain_id)
WHERE unit_domain.unit_id = inist_account.main_unit
AND domain.ebsco is true
ORDER BY unit_domain.index ASC`
);

const returnFields = [
    'id',
    'username',
    'password',
    'name',
    'firstname',
    'mail',
    'phone',
    'dr',
    'comment',
    'subscription_date',
    'expiration_date',
    'main_institute',
    'main_unit',
    `ARRAY(${selectInstitutes}) AS institutes`,
    `ARRAY(${selectMainInstituteDomains}) as main_institute_domains`,
    `ARRAY(${selectMainInstituteGroups}) as main_institute_groups`,
    `ARRAY(${selectUnits}) AS units`,
    `ARRAY(${selectMainUnitDomains}) as main_unit_domains`,
    `ARRAY(${selectMainUnitGroups}) as main_unit_groups`,
    `ARRAY(${selectDomains}) AS domains`,
    `ARRAY(${selectGroups}) AS groups`
];

const inistAccountQueries = crud('inist_account', [
    'username',
    'password',
    'name',
    'firstname',
    'mail',
    'phone',
    'dr',
    'comment',
    'main_institute',
    'main_unit',
    'subscription_date',
    'expiration_date'
], ['id'], [
    'id',
    'username',
    'password',
    'name',
    'firstname',
    'mail',
    'phone',
    'dr',
    'comment',
    'main_institute',
    'main_unit',
    'subscription_date',
    'expiration_date'
], [
    (queries) => {
        queries.selectOne.returnFields(returnFields);

        queries.selectPage
        .table(
`inist_account
LEFT JOIN inist_account_unit ON inist_account_unit.inist_account_id = inist_account.id
LEFT JOIN unit ON (unit.id = inist_account_unit.unit_id)
LEFT JOIN inist_account_institute ON inist_account_institute.inist_account_id = inist_account.id
LEFT JOIN unit_institute ON unit_institute.unit_id = unit.id
LEFT JOIN institute ON (institute.id = inist_account_institute.institute_id) OR (institute.id = unit_institute.institute_id)
LEFT JOIN inist_account_domain ON inist_account_domain.inist_account_id = inist_account.id
LEFT JOIN unit_domain ON unit_domain.unit_id = unit.id
LEFT JOIN institute_domain ON (institute_domain.institute_id = institute.id)
LEFT JOIN domain ON (domain.id = inist_account_domain.domain_id) OR (domain.id = unit_domain.domain_id) OR (domain.id = institute_domain.domain_id)
`
        )
        .groupByFields([
            'inist_account.id',
            'inist_account.username',
            'inist_account.password',
            'inist_account.name',
            'inist_account.firstname',
            'inist_account.mail',
            'inist_account.phone',
            'inist_account.dr',
            'inist_account.comment',
            'inist_account.subscription_date',
            'inist_account.expiration_date',
            'inist_account.main_institute',
            'inist_account.main_unit'
        ])
        .returnFields(returnFields.map(field => {
            if(field.match(/ARRAY/)) {
                return field;
            }

            return `inist_account.${field}`;
        }))
        .searchableFields([
            'inist_account.id',
            'inist_account.username',
            'inist_account.password',
            'inist_account.name',
            'inist_account.firstname',
            'inist_account.mail',
            'inist_account.phone',
            'inist_account.dr',
            'inist_account.comment',
            'inist_account.subscription_date',
            'inist_account.expiration_date',
            'inist_account.main_institute',
            'inist_account.main_unit',
            'domain.name',
            'unit.id',
            'institute.id'
        ]);
    }
]);

const selectOneByUsernameQuery = selectOne('inist_account', ['username'], returnFields);

const selectEzTicketInfoForIdQuery = selectOne('inist_account', ['id'], [
    'username',
    `ARRAY(${selectMainInstituteCode}) AS institute`,
    `ARRAY(${selectMainUnitCode}) AS unit`,
    `ARRAY(${selectMainUnitGroups}) as main_unit_groups`,
    `ARRAY(${selectMainInstituteGroups}) as main_institute_groups`,
    `ARRAY(${selectGroups}) AS groups`
]);

const batchUpsertPerUsernameQuery = batchUpsert('inist_account', ['username'], [
    'username',
    'password',
    'name',
    'firstname',
    'mail',
    'phone',
    'dr',
    'comment',
    'subscription_date',
    'expiration_date'
]);

export const addAllDomains = (inistAccount) => {
    if(!inistAccount) {
        return null;
    }
    return {
        ...inistAccount,
        all_domains: _.uniq(
            inistAccount.main_institute_domains
            .concat(inistAccount.main_unit_domains)
            .concat(inistAccount.domains)
        ),
        all_groups: _.uniq(
            inistAccount.main_institute_groups
            .concat(inistAccount.main_unit_groups)
            .concat(inistAccount.groups)
        )
    };
};

export default (client) => {
    const domainQueries = Domain(client);
    const instituteQueries = Institute(client);
    const unitQueries = Unit(client);
    const inistAccountInstituteQueries = InistAccountInstitute(client);
    const inistAccountUnitQueries = InistAccountUnit(client);
    const queries = inistAccountQueries(client);

    const baseSelectOne = queries.selectOne;
    const baseSelectPage = queries.selectPage;
    const baseUpdateOne = queries.updateOne;
    const baseInsertOne = queries.insertOne;
    const inistAccountDomainQueries = InistAccountDomain(client);

    const baseSelectOneByUsername = selectOneByUsernameQuery(client);
    const baseSelectEzTicketInfoForId = selectEzTicketInfoForIdQuery(client);
    queries.batchUpsertPerUsername = batchUpsertPerUsernameQuery(client);

    queries.updateDomains = entityAssigner(
        domainQueries.selectByNames,
        domainQueries.selectByInistAccountId,
        inistAccountDomainQueries.unassignDomainFromInistAccount,
        inistAccountDomainQueries.assignDomainToInistAccount
    );

    queries.updateInstitutes = entityAssigner(
        instituteQueries.selectByIds,
        instituteQueries.selectByInistAccountId,
        inistAccountInstituteQueries.unassignInstituteFromInistAccount,
        inistAccountInstituteQueries.assignInstituteToInistAccount
    );

    queries.updateUnits = entityAssigner(
        unitQueries.selectByIds,
        unitQueries.selectByInistAccountId,
        inistAccountUnitQueries.unassignUnitFromInistAccount,
        inistAccountUnitQueries.assignUnitToInistAccount
    );

    queries.selectOneByUsername = function* selectOneByUsername(...args) {
        const inistAccount = yield baseSelectOneByUsername(...args);

        return addAllDomains(inistAccount);
    };

    queries.selectEzTicketInfoForIdQuery = function* selectEzTicketInfoForIdQuery(...args) {
        const ezTicketInfo = yield baseSelectEzTicketInfoForId(...args);
        return {
            username: ezTicketInfo.username,
            groups: [
                ..._.uniq(
                    ezTicketInfo.main_institute_groups
                    .concat(ezTicketInfo.main_unit_groups)
                    .concat(ezTicketInfo.groups)
                ),
                'O_CNRS',
                `OU_${ezTicketInfo.unit}`,
                `I_${ezTicketInfo.institute}`,
            ]
        };
    };

    queries.selectOne = function* selectOne(...args) {
        const inistAccount = yield baseSelectOne(...args);

        return addAllDomains(inistAccount);
    };

    queries.selectPage = function* selectPage(...args) {
        const inistAccounts = yield baseSelectPage(...args);

        return inistAccounts.map(addAllDomains);
    };

    queries.insertOne = function* insertOne(inistAccount) {
        try {
            yield client.begin();
            const insertedInistAccount = yield baseInsertOne(inistAccount);

            const domains = yield queries.updateDomains(inistAccount.domains, insertedInistAccount.id);
            const institutes = yield queries.updateInstitutes(inistAccount.institutes, insertedInistAccount.id);
            const units = yield queries.updateUnits(inistAccount.units, insertedInistAccount.id);

            yield client.commit();

            return {
                ...insertedInistAccount,
                domains,
                institutes,
                units
            };
        } catch (error) {
            yield client.rollback();
            throw error;
        }
    };

    queries.updateOne = function* (selector, inistAccount) {
        try {
            yield client.begin();

            let updatedInistAccount;
            try {
                updatedInistAccount = yield baseUpdateOne(selector, inistAccount);
            } catch (error) {
                if(error.message !== 'no valid column to set') {
                    throw error;
                }
                updatedInistAccount = yield queries.selectOne({ id: selector });
            }
            const domains = yield queries.updateDomains(inistAccount.domains, updatedInistAccount.id);
            const institutes = yield queries.updateInstitutes(inistAccount.institutes, updatedInistAccount.id);
            const units = yield queries.updateUnits(inistAccount.units, updatedInistAccount.id);

            yield client.commit();

            return {
                ...updatedInistAccount,
                domains,
                institutes,
                units
            };
        } catch (error) {
            yield client.rollback();
            throw error;
        }
    };

    queries.authenticate = function* authenticate(username, password) {
        const foundInistAccount = yield queries.selectOneByUsername(username);
        if (!foundInistAccount || !foundInistAccount.password || foundInistAccount.password !== password) {
            return false;
        }
        if(foundInistAccount.expiration_date && foundInistAccount.expiration_date.getTime() <= Date.now()) {
            return false;
        }

        return foundInistAccount;
    };

    return queries;
};
