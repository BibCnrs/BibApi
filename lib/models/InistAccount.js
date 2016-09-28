import { crudQueries, selectOneQuery, batchUpsertQuery } from 'co-postgres-queries';

import Community from './Community';
import Institute from './Institute';
import Unit from './Unit';
import InistAccountCommunity from './InistAccountCommunity';
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

const selectCommunities = (
`SELECT id
FROM community
JOIN inist_account_community ON (community.id = inist_account_community.community_id)
WHERE inist_account_community.inist_account_id = inist_account.id
AND community.ebsco is true
ORDER BY index ASC`
);

const selectDomains = (
`SELECT name
FROM community
JOIN inist_account_community ON (community.id = inist_account_community.community_id)
WHERE inist_account_community.inist_account_id = inist_account.id
AND community.ebsco is true
ORDER BY index ASC`
);

const selectGroups = (
`SELECT gate
FROM community
JOIN inist_account_community ON (community.id = inist_account_community.community_id)
WHERE inist_account_community.inist_account_id = inist_account.id
ORDER BY index ASC`
);

const selectMainInstituteCommunities = (
`SELECT community.id
FROM community
JOIN institute_community ON (community.id = institute_community.community_id)
WHERE institute_community.institute_id = inist_account.main_institute
AND community.ebsco is true
ORDER BY institute_community.index ASC`
);

const selectMainInstituteDomains = (
`SELECT community.name
FROM community
JOIN institute_community ON (community.id = institute_community.community_id)
WHERE institute_community.institute_id = inist_account.main_institute
AND community.ebsco is true
ORDER BY institute_community.index ASC`
);

const selectMainInstituteGroups = (
`SELECT community.gate
FROM community
JOIN institute_community ON (community.id = institute_community.community_id)
WHERE institute_community.institute_id = inist_account.main_institute
AND community.ebsco is true
ORDER BY institute_community.index ASC`
);

const selectMainUnitCommunities = (
`SELECT community.id
FROM community
JOIN unit_community ON (community.id = unit_community.community_id)
WHERE unit_community.unit_id = inist_account.main_unit
AND community.ebsco is true
ORDER BY unit_community.index ASC`
);

const selectMainUnitGroups = (
`SELECT community.gate
FROM community
JOIN unit_community ON (community.id = unit_community.community_id)
WHERE unit_community.unit_id = inist_account.main_unit
AND community.ebsco is true
ORDER BY unit_community.index ASC`
);

const selectMainUnitDomains = (
`SELECT community.name
FROM community
JOIN unit_community ON (community.id = unit_community.community_id)
WHERE unit_community.unit_id = inist_account.main_unit
AND community.ebsco is true
ORDER BY unit_community.index ASC`
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
    `ARRAY(${selectUnits}) AS units`
];

const adminReturnFields = [
    ...returnFields,
    `ARRAY(${selectMainInstituteCommunities}) as main_institute_communities`,
    `ARRAY(${selectMainUnitCommunities}) as main_unit_communities`,
    `ARRAY(${selectCommunities}) AS communities`
];

const inistAccountQueries = crudQueries('inist_account', [
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
]);

inistAccountQueries.selectOne.returnFields(adminReturnFields);


inistAccountQueries.selectPage
.table(
`inist_account
LEFT JOIN inist_account_unit ON inist_account_unit.inist_account_id = inist_account.id
LEFT JOIN unit AS main_unit ON (main_unit.id = inist_account.main_unit)
LEFT JOIN unit AS units ON (main_unit.id = inist_account_unit.unit_id)

LEFT JOIN inist_account_institute ON inist_account_institute.inist_account_id = inist_account.id
LEFT JOIN institute main_institute ON (main_institute.id = inist_account.main_institute)
LEFT JOIN institute institutes ON (institutes.id = inist_account_institute.institute_id)

LEFT JOIN inist_account_community ON inist_account_community.inist_account_id = inist_account.id
LEFT JOIN unit_community ON unit_community.unit_id = main_unit.id
LEFT JOIN institute_community ON institute_community.institute_id = main_institute.id
LEFT JOIN community ON (community.id = inist_account_community.community_id) OR (community.id = unit_community.community_id) OR (community.id = institute_community.community_id)
`
)
.groupByFields(['inist_account.id'])
.returnFields(adminReturnFields.map(field => {
    if(field.match(/ARRAY|main_/)) {
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
    'main_institute',
    'main_unit',
    'community.id',
    'main_unit.id',
    'units.id',
    'main_institute.id',
    'institutes.id'
]);

const selectOneByUsernameQuery = selectOneQuery('inist_account', ['username'], [
    ...returnFields,
    `ARRAY(${selectMainInstituteDomains}) as main_institute_domains`,
    `ARRAY(${selectMainUnitDomains}) as main_unit_domains`,
    `ARRAY(${selectDomains}) AS domains`,
    `ARRAY(${selectMainUnitGroups}) as main_unit_groups`,
    `ARRAY(${selectMainInstituteGroups}) as main_institute_groups`,
    `ARRAY(${selectGroups}) AS groups`
]);

const selectEzTicketInfoForIdQuery = selectOneQuery('inist_account', ['id'], [
    'username',
    `ARRAY(${selectMainInstituteCode}) AS institute`,
    `ARRAY(${selectMainUnitCode}) AS unit`,
    `ARRAY(${selectMainUnitGroups}) as main_unit_groups`,
    `ARRAY(${selectMainInstituteGroups}) as main_institute_groups`,
    `ARRAY(${selectGroups}) AS groups`
]);

const batchUpsertPerUsernameQuery = batchUpsertQuery('inist_account', ['username'], [
    'username',
    'password',
    'name',
    'firstname',
    'mail',
    'phone',
    'dr',
    'comment',
    'main_unit',
    'main_institute',
    'subscription_date',
    'expiration_date'
]);

export const addDomains = (inistAccount) => {
    if(!inistAccount) {
        return null;
    }
    return {
        ...inistAccount,
        domains: _.uniq(
            inistAccount.main_institute_domains
            .concat(inistAccount.main_unit_domains)
            .concat(inistAccount.domains)
        ),
        groups: _.uniq(
            inistAccount.main_institute_groups
            .concat(inistAccount.main_unit_groups)
            .concat(inistAccount.groups)
        )
    };
};

export const addAllCommunities = (inistAccount) => {
    if(!inistAccount) {
        return null;
    }

    return {
        ...inistAccount,
        all_communities: _.uniq(
            inistAccount.main_institute_communities
            .concat(inistAccount.main_unit_communities)
            .concat(inistAccount.communities)
        )
    };
};

export default (client) => {
    const communityQueries = Community(client);
    const instituteQueries = Institute(client);
    const unitQueries = Unit(client);
    const inistAccountInstituteQueries = InistAccountInstitute(client);
    const inistAccountUnitQueries = InistAccountUnit(client);
    const queries = client.link(inistAccountQueries);

    const baseSelectOne = queries.selectOne;
    const baseSelectPage = queries.selectPage;
    const baseUpdateOne = queries.updateOne;
    const baseInsertOne = queries.insertOne;
    const inistAccountCommunityQueries = InistAccountCommunity(client);

    const baseSelectOneByUsername = client.link(selectOneByUsernameQuery);
    const baseSelectEzTicketInfoForId = client.link(selectEzTicketInfoForIdQuery);
    queries.batchUpsertPerUsername = client.link(batchUpsertPerUsernameQuery);

    queries.updateCommunities = entityAssigner(
        communityQueries.selectByIds,
        communityQueries.selectByInistAccountId,
        inistAccountCommunityQueries.unassignCommunityFromInistAccount,
        inistAccountCommunityQueries.assignCommunityToInistAccount
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

        return addDomains(inistAccount);
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

        return addAllCommunities(inistAccount);
    };

    queries.selectPage = function* selectPage(...args) {
        const inistAccounts = yield baseSelectPage(...args);

        return inistAccounts.map(addAllCommunities);
    };

    queries.insertOne = function* insertOne(inistAccount) {
        try {
            yield client.begin();
            const insertedInistAccount = yield baseInsertOne(inistAccount);

            const communities = yield queries.updateCommunities(inistAccount.communities, insertedInistAccount.id);
            const institutes = yield queries.updateInstitutes(inistAccount.institutes, insertedInistAccount.id);
            const units = yield queries.updateUnits(inistAccount.units, insertedInistAccount.id);

            yield client.commit();

            return {
                ...insertedInistAccount,
                communities,
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
            const communities = yield queries.updateCommunities(inistAccount.communities, updatedInistAccount.id);
            const institutes = yield queries.updateInstitutes(inistAccount.institutes, updatedInistAccount.id);
            const units = yield queries.updateUnits(inistAccount.units, updatedInistAccount.id);

            yield client.commit();

            return {
                ...updatedInistAccount,
                communities,
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
