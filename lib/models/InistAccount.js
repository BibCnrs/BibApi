import { crud, selectOne, batchUpsert } from 'co-postgres-queries';

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
`SELECT community.name
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
    `ARRAY(${selectMainInstituteCommunities}) as main_institute_communities`,
    `ARRAY(${selectMainInstituteGroups}) as main_institute_groups`,
    `ARRAY(${selectUnits}) AS units`,
    `ARRAY(${selectMainUnitCommunities}) as main_unit_communities`,
    `ARRAY(${selectMainUnitGroups}) as main_unit_groups`,
    `ARRAY(${selectCommunities}) AS communities`,
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
LEFT JOIN inist_account_community ON inist_account_community.inist_account_id = inist_account.id
LEFT JOIN unit_community ON unit_community.unit_id = unit.id
LEFT JOIN institute_community ON (institute_community.institute_id = institute.id)
LEFT JOIN community ON (community.id = inist_account_community.community_id) OR (community.id = unit_community.community_id) OR (community.id = institute_community.community_id)
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
            'community.name',
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
        ),
        all_groups: _.uniq(
            inistAccount.main_institute_groups
            .concat(inistAccount.main_unit_groups)
            .concat(inistAccount.groups)
        )
    };
};

export default (client) => {
    const communityQueries = Community(client);
    const instituteQueries = Institute(client);
    const unitQueries = Unit(client);
    const inistAccountInstituteQueries = InistAccountInstitute(client);
    const inistAccountUnitQueries = InistAccountUnit(client);
    const queries = inistAccountQueries(client);

    const baseSelectOne = queries.selectOne;
    const baseSelectPage = queries.selectPage;
    const baseUpdateOne = queries.updateOne;
    const baseInsertOne = queries.insertOne;
    const inistAccountCommunityQueries = InistAccountCommunity(client);

    const baseSelectOneByUsername = selectOneByUsernameQuery(client);
    const baseSelectEzTicketInfoForId = selectEzTicketInfoForIdQuery(client);
    queries.batchUpsertPerUsername = batchUpsertPerUsernameQuery(client);

    queries.updateCommunities = entityAssigner(
        communityQueries.selectByNames,
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

        return addAllCommunities(inistAccount);
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
