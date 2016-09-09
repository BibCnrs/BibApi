import { crud, selectOne, upsertOne } from 'co-postgres-queries';
import _ from 'lodash';

import Community from './Community';
import Institute from './Institute';
import Unit from './Unit';
import JanusAccountCommunity from './JanusAccountCommunity';
import JanusAccountInstitute from './JanusAccountInstitute';
import JanusAccountUnit from './JanusAccountUnit';
import entityAssigner from './entityAssigner';

const selectMainInstituteCode = (
`SELECT code
FROM institute
WHERE institute.id = janus_account.primary_institute
LIMIT 1`
);

const selectMainUnitCode = (
`SELECT code
FROM unit
WHERE unit.id = janus_account.primary_unit
LIMIT 1`
);

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

const selectCommunities = (
`SELECT name
FROM community
JOIN janus_account_community ON (community.id = janus_account_community.community_id)
WHERE janus_account_community.janus_account_id = janus_account.id
AND community.ebsco is true
ORDER BY index ASC`
);

const selectGroups = (
`SELECT gate
FROM community
JOIN janus_account_community ON (community.id = janus_account_community.community_id)
WHERE janus_account_community.janus_account_id = janus_account.id
ORDER BY index ASC`
);

const selectPrimaryInstituteCommunities = (
`SELECT community.name
FROM community
JOIN institute_community ON (community.id = institute_community.community_id)
JOIN institute ON (institute_community.institute_id = institute.id)
WHERE institute.id = janus_account.primary_institute
AND community.ebsco is true
ORDER BY index ASC`
);

const selectPrimaryInstituteGroups = (
`SELECT community.gate
FROM community
JOIN institute_community ON (community.id = institute_community.community_id)
JOIN institute ON (institute_community.institute_id = institute.id)
WHERE institute.id = janus_account.primary_institute
ORDER BY index ASC`
);

const selectPrimaryUnitCommunities = (
`SELECT community.name
FROM community
JOIN unit_community ON (community.id = unit_community.community_id)
JOIN unit ON (unit_community.unit_id = unit.id)
WHERE unit.id = janus_account.primary_unit
AND community.ebsco is true
ORDER BY index ASC`
);

const selectPrimaryUnitGroups = (
`SELECT community.gate
FROM community
JOIN unit_community ON (community.id = unit_community.community_id)
JOIN unit ON (unit_community.unit_id = unit.id)
WHERE unit.id = janus_account.primary_unit
ORDER BY index ASC`
);

const returnFields = [
    'id',
    'uid',
    'name',
    'firstname',
    'mail',
    'cnrs',
    'last_connexion',
    'comment',
    'primary_institute',
    `ARRAY(${selectPrimaryInstituteCommunities}) as primary_institute_communities`,
    `ARRAY(${selectAdditionalInstitutes}) AS additional_institutes`,
    'primary_unit',
    `ARRAY(${selectPrimaryUnitCommunities}) as primary_unit_communities`,
    `ARRAY(${selectAdditionalUnits}) AS additional_units`,
    `ARRAY(${selectCommunities}) AS communities`
];

const janusAccountQueries = crud('janus_account', [
    'uid',
    'name',
    'firstname',
    'mail',
    'cnrs',
    'comment',
    'last_connexion',
    'primary_institute',
    'primary_unit'
], ['id'], [
    'id',
    'uid',
    'name',
    'firstname',
    'mail',
    'cnrs',
    'comment',
    'last_connexion',
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

LEFT JOIN janus_account_community ON janus_account_community.janus_account_id = janus_account.id
LEFT JOIN unit_community ON unit_community.unit_id = unit.id
LEFT JOIN institute_community ON (institute_community.institute_id = institute.id)
LEFT JOIN community ON (community.id = janus_account_community.community_id) OR (community.id = unit_community.community_id) OR (community.id = institute_community.community_id)`
        )
        .groupByFields([
            'janus_account.id',
            'janus_account.uid',
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
            'janus_account.uid',
            'janus_account.mail',
            'janus_account.cnrs',
            'janus_account.primary_institute',
            'janus_account.primary_unit',
            'community.name',
            'unit.id',
            'institute.id'
        ]);

    }
]);

const upsertOnePerUidQuery = upsertOne(
    'janus_account',
    ['uid'],
    ['mail', 'name', 'firstname', 'cnrs', 'last_connexion', 'primary_institute', 'primary_unit'],
    ['id', 'uid', 'mail', 'name', 'firstname', 'cnrs', 'last_connexion', 'primary_institute', 'primary_unit']
);
const selectOneByUidQuery = selectOne('janus_account', ['uid'], [
    ...returnFields,
    `ARRAY(${selectPrimaryInstituteGroups}) as primary_institute_groups`,
    `ARRAY(${selectPrimaryUnitGroups}) as primary_unit_groups`,
    `ARRAY(${selectGroups}) AS groups`
]);

const selectEzTicketInfoForIdQuery = selectOne('janus_account', ['id'], [
    'mail',
    'cnrs',
    `ARRAY(${selectMainInstituteCode}) AS institute`,
    `ARRAY(${selectMainUnitCode}) AS unit`,
    `ARRAY(${selectPrimaryInstituteGroups}) as primary_institute_groups`,
    `ARRAY(${selectPrimaryUnitGroups}) as primary_unit_groups`,
    `ARRAY(${selectGroups}) AS groups`
]);

export const addDomains = (janusAccount) => {
    if(!janusAccount) {
        return janusAccount;
    }

    return {
        ...janusAccount,
        domains: _.uniq(
            janusAccount.primary_institute_communities
            .concat(janusAccount.primary_unit_communities)
            .concat(janusAccount.communities)
        ),
        groups: _.uniq(
            janusAccount.primary_institute_groups
            .concat(janusAccount.primary_unit_groups)
            .concat(janusAccount.groups)
        )
    };
};

export const addAllCommunities = (janusAccount) => {
    if(!janusAccount) {
        return janusAccount;
    }

    return {
        ...janusAccount,
        all_communities: _.uniq(
            janusAccount.primary_institute_communities
            .concat(janusAccount.primary_unit_communities)
            .concat(janusAccount.communities)
        )
    };
};

export default (client) => {
    const communityQueries = Community(client);
    const instituteQueries = Institute(client);
    const unitQueries = Unit(client);
    const janusAccountInstituteQueries = JanusAccountInstitute(client);
    const janusAccountUnitQueries = JanusAccountUnit(client);
    const queries = janusAccountQueries(client);

    const baseSelectOne = queries.selectOne;
    const baseSelectPage = queries.selectPage;
    const baseUpdateOne = queries.updateOne;
    const baseInsertOne = queries.insertOne;
    const janusAccountCommunityQueries = JanusAccountCommunity(client);

    queries.upsertOnePerUid = upsertOnePerUidQuery(client);
    const baseSelectEzTicketGroupForId = selectEzTicketInfoForIdQuery(client);
    const baseSelectOneByUid = selectOneByUidQuery(client);

    queries.updateCommunities = entityAssigner(
        communityQueries.selectByNames,
        communityQueries.selectByJanusAccountId,
        janusAccountCommunityQueries.unassignCommunityFromUser,
        janusAccountCommunityQueries.assignCommunityToUser
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

    queries.selectOneByUid = function* (...args) {
        const janusAccount = yield baseSelectOneByUid(...args);

        return addDomains(janusAccount);
    };

    queries.selectEzTicketInfoForIdQuery = function* selectEzTicketInfoForIdQuery(...args) {
        const result = yield baseSelectEzTicketGroupForId(...args);
        return {
            username: result.mail,
            groups: [
                ..._.uniq(
                    result.primary_institute_groups
                    .concat(result.primary_unit_groups)
                    .concat(result.groups)
                ),
                `O_${result.cnrs ? 'CNRS' : 'OTHER'}`,
                `OU_${result.unit}`,
                `I_${result.institute}`,
            ]
        };
    };

    queries.selectOne = function* (...args) {
        const janusAccount = yield baseSelectOne(...args);

        return addAllCommunities(janusAccount);
    };

    queries.selectPage = function* (...args) {
        const janusAccounts = yield baseSelectPage(...args);

        return janusAccounts.map(addAllCommunities);
    };

    queries.insertOne = function* insertOne(janusAccount) {
        try {
            yield client.begin();
            const insertedUser = yield baseInsertOne(janusAccount);

            const communities = yield queries.updateCommunities(janusAccount.communities, insertedUser.id);
            const additional_institutes = yield queries.updateAdditionalInstitutes(janusAccount.additional_institutes, insertedUser.id);
            const additional_units = yield queries.updateAdditionalUnits(janusAccount.additional_units, insertedUser.id);

            yield client.commit();

            return {
                ...insertedUser,
                communities,
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
            const communities = yield queries.updateCommunities(janusAccount.communities, updatedUser.id);
            const additional_institutes = yield queries.updateAdditionalInstitutes(janusAccount.additional_institutes, updatedUser.id);
            const additional_units = yield queries.updateAdditionalUnits(janusAccount.additional_units, updatedUser.id);

            yield client.commit();

            return {
                ...updatedUser,
                communities,
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
