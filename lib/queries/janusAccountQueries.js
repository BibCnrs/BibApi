import {
    crudQueries,
    selectOneQuery,
    selectPageQuery,
    upsertOneQuery,
    updateOneQuery,
} from 'co-postgres-queries';

const selectMainInstituteCode = `SELECT code
FROM institute
WHERE institute.id = janus_account.primary_institute
LIMIT 1`;

const selectMainUnitCode = `SELECT code
FROM unit
WHERE unit.id = janus_account.primary_unit
LIMIT 1`;

const selectAdditionalInstitutes = `SELECT id
FROM institute
JOIN janus_account_institute ON (institute.id = janus_account_institute.institute_id)
WHERE janus_account_institute.janus_account_id = janus_account.id
ORDER BY index ASC`;

const selectAdditionalInstitutesNames = `SELECT name
FROM institute
JOIN janus_account_institute ON (institute.id = janus_account_institute.institute_id)
WHERE janus_account_institute.janus_account_id = janus_account.id
ORDER BY index ASC`;

const selectAdditionalUnits = `SELECT id
FROM unit
JOIN janus_account_unit ON (unit.id = janus_account_unit.unit_id)
WHERE janus_account_unit.janus_account_id = janus_account.id
ORDER BY index ASC`;

const selectAdditionalUnitsCodes = `SELECT code
FROM unit
JOIN janus_account_unit ON (unit.id = janus_account_unit.unit_id)
WHERE janus_account_unit.janus_account_id = janus_account.id
ORDER BY index ASC`;

const selectCommunities = `SELECT community.id
FROM community
JOIN janus_account_community ON (community.id = janus_account_community.community_id)
WHERE janus_account_community.janus_account_id = janus_account.id
ORDER BY index ASC`;

const selectCommunitiesNames = `SELECT community.name
FROM community
JOIN janus_account_community ON (community.id = janus_account_community.community_id)
WHERE janus_account_community.janus_account_id = janus_account.id
ORDER BY index ASC`;

const selectDomains = `SELECT community.name
FROM community
JOIN janus_account_community ON (community.id = janus_account_community.community_id)
WHERE janus_account_community.janus_account_id = janus_account.id
AND community.ebsco is true
ORDER BY index ASC`;

const selectGroups = `SELECT gate
FROM community
JOIN janus_account_community ON (community.id = janus_account_community.community_id)
WHERE janus_account_community.janus_account_id = janus_account.id
ORDER BY index ASC`;

const selectPrimaryInstituteCommunities = `SELECT community.id
FROM community
JOIN institute_community ON (community.id = institute_community.community_id)
JOIN institute ON (institute_community.institute_id = institute.id)
WHERE institute.id = janus_account.primary_institute
ORDER BY index ASC`;

const selectPrimaryInstituteCommunitiesNames = `SELECT community.name
FROM community
JOIN institute_community ON (community.id = institute_community.community_id)
JOIN institute ON (institute_community.institute_id = institute.id)
WHERE institute.id = janus_account.primary_institute
ORDER BY index ASC`;

const selectPrimaryInstituteDomains = `SELECT community.name
FROM community
JOIN institute_community ON (community.id = institute_community.community_id)
JOIN institute ON (institute_community.institute_id = institute.id)
WHERE institute.id = janus_account.primary_institute
AND community.ebsco is true
ORDER BY index ASC`;

const selectPrimaryInstituteGroups = `SELECT community.gate
FROM community
JOIN institute_community ON (community.id = institute_community.community_id)
JOIN institute ON (institute_community.institute_id = institute.id)
WHERE institute.id = janus_account.primary_institute
ORDER BY index ASC`;

const selectPrimaryUnitCommunities = `SELECT community.id
FROM community
JOIN unit_community ON (community.id = unit_community.community_id)
JOIN unit ON (unit_community.unit_id = unit.id)
WHERE unit.id = janus_account.primary_unit
ORDER BY index ASC`;

const selectPrimaryUnitCommunitiesNames = `SELECT community.name
FROM community
JOIN unit_community ON (community.id = unit_community.community_id)
JOIN unit ON (unit_community.unit_id = unit.id)
WHERE unit.id = janus_account.primary_unit
ORDER BY index ASC`;

const selectPrimaryUnitDomains = `SELECT community.name
FROM community
JOIN unit_community ON (community.id = unit_community.community_id)
JOIN unit ON (unit_community.unit_id = unit.id)
WHERE unit.id = janus_account.primary_unit
AND community.ebsco is true
ORDER BY index ASC`;

const selectPrimaryUnitGroups = `SELECT community.gate
FROM community
JOIN unit_community ON (community.id = unit_community.community_id)
JOIN unit ON (unit_community.unit_id = unit.id)
WHERE unit.id = janus_account.primary_unit
ORDER BY index ASC`;

const returnFields = [
    'id',
    'uid',
    'name',
    'favorite_domain',
    'firstname',
    'mail',
    'cnrs',
    'last_connexion',
    'first_connexion',
    'comment',
    'primary_institute',
    `ARRAY(${selectAdditionalInstitutes}) AS additional_institutes`,
    'primary_unit',
    `ARRAY(${selectAdditionalUnits}) AS additional_units`,
    'active',
    'favourite_resources',
];

const adminReturnFields = [
    ...returnFields,
    `ARRAY(${selectPrimaryInstituteCommunities}) as primary_institute_communities`,
    `ARRAY(${selectPrimaryUnitCommunities}) as primary_unit_communities`,
    `ARRAY(${selectCommunities}) AS communities`,
];

const janusAccountQueries = crudQueries(
    'janus_account',
    [
        'uid',
        'name',
        'firstname',
        'mail',
        'cnrs',
        'comment',
        'last_connexion',
        'first_connexion',
        'primary_institute',
        'primary_unit',
        'favorite_domain',
        'active',
        'favourite_resources',
    ],
    ['id'],
    [
        'id',
        'uid',
        'name',
        'firstname',
        'mail',
        'cnrs',
        'comment',
        'last_connexion',
        'first_connexion',
        'primary_institute',
        'primary_unit',
        'favorite_domain',
        'active',
        'favourite_resources',
    ],
);

janusAccountQueries.updateOne.updatableFields([
    'uid',
    'name',
    'firstname',
    'mail',
    'cnrs',
    'comment',
    'last_connexion',
    'first_connexion',
    'primary_institute',
    'primary_unit',
    'favorite_domain',
    'active',
]);

janusAccountQueries.selectOne.returnFields(adminReturnFields);

janusAccountQueries.selectPage
    .table('janus_account')
    .groupByFields(['janus_account.id'])
    .returnFields(
        adminReturnFields.map(field => {
            if (field.match(/ARRAY|primary_/)) {
                return field;
            }

            return `janus_account.${field}`;
        }),
    )
    .searchableFields([
        'janus_account.id',
        'janus_account.uid',
        'janus_account.name',
        'janus_account.firstname',
        'janus_account.mail',
        'janus_account.cnrs',
        'janus_account.comment',
        'janus_account.last_connexion',
        'janus_account.first_connexion',
        'janus_account.primary_institute',
        'janus_account.primary_unit',
        'janus_account.active',
    ]);

const selectAllForExport = selectPageQuery(
    `janus_account
LEFT JOIN institute as primary_institute ON (primary_institute.id = janus_account.primary_institute)
LEFT JOIN unit as primary_unit ON (primary_unit.id = janus_account.primary_unit)
`,
    ['id'],
    [
        'janus_account.id',
        'janus_account.uid',
        'janus_account.name',
        'janus_account.firstname',
        'janus_account.mail',
        'janus_account.cnrs',
        'primary_institute.name AS primary_institute',
        `ARRAY(${selectAdditionalInstitutesNames}) AS additional_institutes`,
        'primary_unit.code AS primary_unit',
        `ARRAY(${selectAdditionalUnitsCodes}) AS additional_units`,
        `ARRAY(${selectCommunitiesNames}) AS communities`,
        `ARRAY(
            (${selectPrimaryInstituteCommunitiesNames})
            UNION
            (${selectPrimaryUnitCommunitiesNames})
            UNION
            (${selectCommunitiesNames})
        ) AS all_communities`,
        'janus_account.last_connexion',
        'janus_account.first_connexion',
        'janus_account.comment',
        'janus_account.active',
        'janus_account.favourite_resources',
    ],
);

const upsertOnePerUid = upsertOneQuery(
    'janus_account',
    ['uid'],
    [
        'mail',
        'name',
        'firstname',
        'cnrs',
        'last_connexion',
        'primary_institute',
        'primary_unit',
        'active',
        'favourite_resources',
    ],
    [
        'id',
        'uid',
        'mail',
        'name',
        'firstname',
        'cnrs',
        'last_connexion',
        'first_connexion',
        'primary_institute',
        'primary_unit',
        'active',
        'favourite_resources',
    ],
);
const selectOneByUid = selectOneQuery(
    'janus_account',
    ['uid'],
    [
        ...returnFields,
        `ARRAY(${selectPrimaryInstituteDomains}) as primary_institute_domains`,
        `ARRAY(${selectPrimaryUnitDomains}) as primary_unit_domains`,
        `ARRAY(${selectDomains}) AS domains`,
        `ARRAY(${selectPrimaryInstituteGroups}) as primary_institute_groups`,
        `ARRAY(${selectPrimaryUnitGroups}) as primary_unit_groups`,
        `ARRAY(${selectGroups}) AS groups`,
    ],
);

const selectBySimilarUid = uid => ({
    sql: `SELECT * FROM janus_account WHERE uid LIKE $uid ORDER BY last_connexion DESC, uid DESC`,
    parameters: {
        uid: `${uid}%`,
    },
});

const selectOneById = selectOneQuery(
    'janus_account',
    ['id'],
    [
        ...returnFields,
        `ARRAY(${selectPrimaryInstituteDomains}) as primary_institute_domains`,
        `ARRAY(${selectPrimaryUnitDomains}) as primary_unit_domains`,
        `ARRAY(${selectDomains}) AS domains`,
        `ARRAY(${selectPrimaryInstituteGroups}) as primary_institute_groups`,
        `ARRAY(${selectPrimaryUnitGroups}) as primary_unit_groups`,
        `ARRAY(${selectGroups}) AS groups`,
    ],
);

const selectEzTicketInfoForId = selectOneQuery(
    'janus_account',
    ['id'],
    [
        'mail',
        'cnrs',
        `ARRAY(${selectMainInstituteCode}) AS institute`,
        `ARRAY(${selectMainUnitCode}) AS unit`,
        `ARRAY(${selectPrimaryInstituteGroups}) as primary_institute_groups`,
        `ARRAY(${selectPrimaryUnitGroups}) as primary_unit_groups`,
        `ARRAY(${selectGroups}) AS groups`,
    ],
);

const updateFavouriteResources = updateOneQuery(
    'janus_account',
    ['favourite_resources'],
    ['id'],
);

const getFavouriteResources = selectOneQuery(
    'janus_account',
    ['id'],
    ['favourite_resources'],
);

const communityJoin = `LEFT JOIN janus_account_community ON janus_account_community.janus_account_id = janus_account.id
LEFT JOIN unit_community ON unit_community.unit_id = janus_account.primary_unit
LEFT JOIN institute_community ON (institute_community.institute_id = janus_account.primary_institute)
LEFT JOIN community ON (community.id = janus_account_community.community_id) OR (community.id = unit_community.community_id) OR (community.id = institute_community.community_id)`;

const primaryInstituteJoin =
    'LEFT JOIN institute as primary_institute ON (primary_institute.id = janus_account.primary_institute)';

const institutesJoin = `LEFT JOIN janus_account_institute ON janus_account_institute.janus_account_id = janus_account.id
LEFT JOIN institute as institutes ON (institutes.id = janus_account_institute.institute_id)`;

const primaryUnitJoin =
    'LEFT JOIN unit as primary_unit ON (primary_unit.id = janus_account.primary_unit)';

const unitsJoin = `LEFT JOIN janus_account_unit ON janus_account_unit.janus_account_id = janus_account.id
LEFT JOIN unit as units ON (units.id = janus_account_unit.unit_id)`;

// define join to add for query to be able to filter on certain field
const filtersJoin = {
    'community.id': communityJoin,
    'primary_institute.id': primaryInstituteJoin,
    'institutes.id': institutesJoin,
    'primary_unit.id': primaryUnitJoin,
    'units.id': unitsJoin,
};

export default {
    ...janusAccountQueries,
    upsertOnePerUid,
    selectOneById,
    selectOneByUid,
    selectAllForExport,
    selectEzTicketInfoForId,
    selectBySimilarUid,
    updateFavouriteResources,
    getFavouriteResources,
    filtersJoin,
};
