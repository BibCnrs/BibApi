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

const selectUnits = (
`SELECT id
FROM unit
JOIN inist_account_unit ON (unit.id = inist_account_unit.unit_id)
WHERE inist_account_unit.inist_account_id = inist_account.id
ORDER BY index ASC`
);

const selectDomains = (
`SELECT name
FROM domain
JOIN inist_account_domain ON (domain.id = inist_account_domain.domain_id)
WHERE inist_account_domain.inist_account_id = inist_account.id
ORDER BY index ASC`
);

const selectInstitutesDomains = (
`SELECT domain.name
FROM domain
JOIN institute_domain ON (domain.id = institute_domain.domain_id)
JOIN institute ON (institute_domain.institute_id = institute.id)
JOIN inist_account_institute ON (institute.id = inist_account_institute.institute_id)
WHERE inist_account_institute.inist_account_id = inist_account.id
ORDER BY inist_account_institute.index ASC, institute_domain.index ASC`
);

const selectUnitsDomains = (
`SELECT domain.name
FROM domain
JOIN unit_domain ON (domain.id = unit_domain.domain_id)
JOIN unit ON (unit_domain.unit_id = unit.id)
JOIN inist_account_unit ON (unit.id = inist_account_unit.unit_id)
WHERE inist_account_unit.inist_account_id = inist_account.id
ORDER BY inist_account_unit.index ASC, unit_domain.index ASC`
);

const selectUnitsInstitutesDomains = (
`SELECT domain.name
FROM domain
JOIN institute_domain ON (domain.id = institute_domain.domain_id)
JOIN unit_institute ON (unit_institute.institute_id = institute_domain.institute_id)
JOIN inist_account_unit ON (inist_account_unit.unit_id = unit_institute.unit_id)
WHERE inist_account_unit.inist_account_id = inist_account.id
ORDER BY inist_account_unit.index ASC, unit_institute.index ASC, institute_domain.index ASC`
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
    `ARRAY(${selectInstitutes}) AS institutes`,
    `ARRAY(${selectInstitutesDomains}) as institutes_domains`,
    `ARRAY(${selectUnits}) AS units`,
    `ARRAY(${selectUnitsDomains}) as units_domains`,
    `ARRAY(${selectUnitsInstitutesDomains}) as units_institutes_domains`,
    `ARRAY(${selectDomains}) AS domains`
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
    'subscription_date',
    'expiration_date'
], [
    (queries) => {
        queries.selectOne.returnFields(returnFields);
        queries.selectPage.returnFields(returnFields);
    }
]);

const selectOneByUsernameQuery = selectOne('inist_account', ['username'], returnFields);

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
            inistAccount.institutes_domains
            .concat(inistAccount.units_domains)
            .concat(inistAccount.units_institutes_domains)
            .concat(inistAccount.domains)
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

        return foundInistAccount;
    };

    return queries;
};
