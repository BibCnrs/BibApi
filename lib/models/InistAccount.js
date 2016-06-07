import { crud, selectOne, batchUpsert } from 'co-postgres-queries';

import Domain from './Domain';
import Institute from './Institute';
import Unit from './Unit';
import InistAccountDomain from './InistAccountDomain';
import InistAccountInstitute from './InistAccountInstitute';
import InistAccountUnit from './InistAccountUnit';
import { isPasswordValid, hashPassword, generateSalt } from '../services/passwordHash';
import entityAssigner from './entityAssigner';

const selectInstitutes = (
`SELECT id
FROM institute
JOIN inist_account_institute ON (institute.id = inist_account_institute.institute_id)
WHERE inist_account_institute.inist_account_id = inist_account.id ORDER BY name`
);

const selectUnits = (
`SELECT id
FROM unit
JOIN inist_account_unit ON (unit.id = inist_account_unit.unit_id)
WHERE inist_account_unit.inist_account_id = inist_account.id ORDER BY code`
);

const selectDomains = (
`SELECT name
FROM domain
JOIN inist_account_domain ON (domain.id = inist_account_domain.domain_id)
WHERE inist_account_domain.inist_account_id = inist_account.id ORDER BY name`
);

const selectInstitutesDomains = (
`SELECT domain.name
FROM domain
JOIN institute_domain ON (domain.id = institute_domain.domain_id)
JOIN institute ON (institute_domain.institute_id = institute.id)
JOIN inist_account_institute ON (institute.id = inist_account_institute.institute_id)
WHERE inist_account_institute.inist_account_id = inist_account.id`
);

const selectUnitsDomains = (
`SELECT domain.name
FROM domain
JOIN unit_domain ON (domain.id = unit_domain.domain_id)
JOIN unit ON (unit_domain.unit_id = unit.id)
JOIN inist_account_unit ON (unit.id = inist_account_unit.unit_id)
WHERE inist_account_unit.inist_account_id = inist_account.id`
);

const selectUnitsInstitutesDomains = (
`SELECT domain.name
FROM domain
JOIN institute_domain ON (domain.id = institute_domain.domain_id)
JOIN unit_institute ON (unit_institute.institute_id = institute_domain.institute_id)
JOIN inist_account_unit ON (inist_account_unit.unit_id = unit_institute.unit_id)
WHERE inist_account_unit.inist_account_id = inist_account.id`
);

const returnFields = [
    'id',
    'username',
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
    'salt',
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

const selectOneByUsernameQuery = selectOne('inist_account', ['username'], returnFields.concat(['password', 'salt']));

const batchUpsertPerUsernameQuery = batchUpsert('inist_account', ['username'], [
    'username',
    'password',
    'salt',
    'name',
    'firstname',
    'mail',
    'phone',
    'dr',
    'comment',
    'subscription_date',
    'expiration_date'
]);

export default (client) => {
    const domainQueries = Domain(client);
    const instituteQueries = Institute(client);
    const unitQueries = Unit(client);
    const inistAccountInstituteQueries = InistAccountInstitute(client);
    const inistAccountUnitQueries = InistAccountUnit(client);
    const queries = inistAccountQueries(client);

    const baseUpdateOne = queries.updateOne;
    const baseInsertOne = queries.insertOne;
    const inistAccountDomainQueries = InistAccountDomain(client);

    queries.selectOneByUsername = selectOneByUsernameQuery(client);
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

    queries.insertOne = function* insertOne(inistAccount) {
        try {
            yield client.begin();
            if (inistAccount.password) {
                inistAccount.salt = yield generateSalt();
                inistAccount.password = yield hashPassword(inistAccount.password, inistAccount.salt);
            }
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
            if (inistAccount.password) {
                inistAccount.salt = yield generateSalt();
                inistAccount.password = yield hashPassword(inistAccount.password, inistAccount.salt);
            }

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
        if (!foundInistAccount || !foundInistAccount.password || !(yield isPasswordValid(password, foundInistAccount.salt, foundInistAccount.password))) {
            return false;
        }

        return foundInistAccount;
    };

    return queries;
};
