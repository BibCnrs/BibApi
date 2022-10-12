import {
    crudQueries,
    selectOneQuery,
    batchUpsertQuery,
} from 'co-postgres-queries';

const selectInstitutes = `SELECT id
FROM institute
JOIN inist_account_institute ON (institute.id = inist_account_institute.institute_id)
WHERE inist_account_institute.inist_account_id = inist_account.id
ORDER BY index ASC`;

const selectMainInstituteCode = `SELECT code
FROM institute
WHERE inist_account.main_institute = institute.id`;

const selectUnits = `SELECT id
FROM unit
JOIN inist_account_unit ON (unit.id = inist_account_unit.unit_id)
WHERE inist_account_unit.inist_account_id = inist_account.id
ORDER BY index ASC`;

const selectMainUnitCode = `SELECT code
FROM unit
WHERE inist_account.main_unit = unit.id`;

const selectCommunities = `SELECT id
FROM community
JOIN inist_account_community ON (community.id = inist_account_community.community_id)
WHERE inist_account_community.inist_account_id = inist_account.id
ORDER BY index ASC`;

const selectDomains = `SELECT name
FROM community
JOIN inist_account_community ON (community.id = inist_account_community.community_id)
WHERE inist_account_community.inist_account_id = inist_account.id
ORDER BY index ASC`;

const selectGroups = `SELECT gate
FROM community
JOIN inist_account_community ON (community.id = inist_account_community.community_id)
WHERE inist_account_community.inist_account_id = inist_account.id
ORDER BY index ASC`;

const selectMainInstituteCommunities = `SELECT community.id
FROM community
JOIN institute_community ON (community.id = institute_community.community_id)
WHERE institute_community.institute_id = inist_account.main_institute
ORDER BY institute_community.index ASC`;

const selectMainInstituteDomains = `SELECT community.name
FROM community
JOIN institute_community ON (community.id = institute_community.community_id)
WHERE institute_community.institute_id = inist_account.main_institute
ORDER BY institute_community.index ASC`;

const selectMainInstituteGroups = `SELECT community.gate
FROM community
JOIN institute_community ON (community.id = institute_community.community_id)
WHERE institute_community.institute_id = inist_account.main_institute
ORDER BY institute_community.index ASC`;

const selectMainUnitCommunities = `SELECT community.id
FROM community
JOIN unit_community ON (community.id = unit_community.community_id)
WHERE unit_community.unit_id = inist_account.main_unit
ORDER BY unit_community.index ASC`;

const selectMainUnitGroups = `SELECT community.gate
FROM community
JOIN unit_community ON (community.id = unit_community.community_id)
WHERE unit_community.unit_id = inist_account.main_unit
ORDER BY unit_community.index ASC`;

const selectMainUnitDomains = `SELECT community.name
FROM community
JOIN unit_community ON (community.id = unit_community.community_id)
WHERE unit_community.unit_id = inist_account.main_unit
ORDER BY unit_community.index ASC`;

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
    `ARRAY(${selectUnits}) AS units`,
    'last_connexion',
    'active',
];

const adminReturnFields = [
    ...returnFields,
    `ARRAY(${selectMainInstituteCommunities}) as main_institute_communities`,
    `ARRAY(${selectMainUnitCommunities}) as main_unit_communities`,
    `ARRAY(${selectCommunities}) AS communities`,
];

const inistAccountQueries = crudQueries(
    'inist_account',
    [
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
        'expiration_date',
        'last_connexion',
        'active',
    ],
    ['id'],
    [
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
        'expiration_date',
        'last_connexion',
        'active',
    ],
);

inistAccountQueries.selectOne.returnFields(adminReturnFields);

inistAccountQueries.selectPage
    .groupByFields(['inist_account.id'])
    .returnFields(
        adminReturnFields.map((field) => {
            if (field.match(/ARRAY/)) {
                return field;
            }

            return `inist_account.${field}`;
        }),
    )
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
        'inist_account.last_connexion',
        'active',
    ]);

const selectOneByUsername = selectOneQuery(
    'inist_account',
    ['username'],
    [
        ...returnFields,
        `ARRAY(${selectMainInstituteDomains}) as main_institute_domains`,
        `ARRAY(${selectMainUnitDomains}) as main_unit_domains`,
        `ARRAY(${selectDomains}) AS domains`,
        `ARRAY(${selectMainUnitGroups}) as main_unit_groups`,
        `ARRAY(${selectMainInstituteGroups}) as main_institute_groups`,
        `ARRAY(${selectGroups}) AS groups`,
    ],
);

const selectEzTicketInfoForId = selectOneQuery(
    'inist_account',
    ['id'],
    [
        'username',
        `ARRAY(${selectMainInstituteCode}) AS institute`,
        `ARRAY(${selectMainUnitCode}) AS unit`,
        `ARRAY(${selectMainUnitGroups}) as main_unit_groups`,
        `ARRAY(${selectMainInstituteGroups}) as main_institute_groups`,
        `ARRAY(${selectGroups}) AS groups`,
    ],
);

const batchUpsertPerUsername = batchUpsertQuery(
    'inist_account',
    ['username'],
    [
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
        'expiration_date',
        'last_connexion',
        'active',
    ],
);

const communityJoin = `LEFT JOIN inist_account_community ON inist_account_community.inist_account_id = inist_account.id
LEFT JOIN unit_community ON unit_community.unit_id = inist_account.main_unit
LEFT JOIN institute_community ON institute_community.institute_id = inist_account.main_institute
LEFT JOIN community ON (community.id = inist_account_community.community_id) OR (community.id = unit_community.community_id) OR (community.id = institute_community.community_id)`;

const mainInstituteJoin =
    'LEFT JOIN institute main_institute ON (main_institute.id = inist_account.main_institute)';

const institutesJoin = `LEFT JOIN inist_account_institute ON inist_account_institute.inist_account_id = inist_account.id
LEFT JOIN institute institutes ON (institutes.id = inist_account_institute.institute_id)`;

const mainUnitJoin =
    'LEFT JOIN unit AS main_unit ON (main_unit.id = inist_account.main_unit)';

const unitsJoin = `LEFT JOIN inist_account_unit ON inist_account_unit.inist_account_id = inist_account.id
LEFT JOIN unit AS units ON (units.id = inist_account_unit.unit_id)`;

// define join to add for query to be able to filter on certain field
const filtersJoin = {
    'community.id': communityJoin,
    'main_institute.id': mainInstituteJoin,
    'institutes.id': institutesJoin,
    'main_unit.id': mainUnitJoin,
    'units.id': unitsJoin,
};

export default {
    ...inistAccountQueries,
    selectOneByUsername,
    selectEzTicketInfoForId,
    batchUpsertPerUsername,
    filtersJoin,
};
