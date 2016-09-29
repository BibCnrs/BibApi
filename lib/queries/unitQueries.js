import { crudQueries, upsertOneQuery, batchUpsertQuery, selectOneQuery, selectPageQuery, selectByOrderedFieldValuesQuery } from 'co-postgres-queries';

const selectCommunities = (
`SELECT id
FROM community
LEFT JOIN unit_community ON (community.id = unit_community.community_id)
WHERE unit_community.unit_id = unit.id
ORDER BY index ASC`
);

const selectCommunitiesName = (
`SELECT name
FROM community
LEFT JOIN unit_community ON (community.id = unit_community.community_id)
WHERE unit_community.unit_id = unit.id
ORDER BY index ASC`
);

const selectInstitutes = (
`SELECT id
FROM institute
LEFT JOIN unit_institute ON (institute.id = unit_institute.institute_id)
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

const unitQueries = crudQueries('unit', fields, ['id'], fields);

unitQueries.selectOne.returnFields(fields.concat([
    `ARRAY(${selectCommunities}) AS communities`,
    `ARRAY(${selectInstitutes}) AS institutes`
]));

unitQueries.selectPage
.table(
`unit
LEFT JOIN unit_institute ON unit_institute.unit_id = unit.id
LEFT JOIN institute ON institute.id = unit_institute.institute_id
LEFT JOIN unit_community ON unit_community.unit_id = unit.id
LEFT JOIN community ON (community.id = unit_community.community_id)
`
)
.groupByFields(['unit.id'])
.returnFields(fields
    .map(field => `unit.${field}`)
    .concat([
        `ARRAY(${selectCommunities}) AS communities`,
        `ARRAY(${selectInstitutes}) AS institutes`
    ])
)
.searchableFields(
    fields
    .map(field => `unit.${field}`)
    .concat([
        'community.id',
        'institute.id'
    ])
);

const upsertOnePerCode = upsertOneQuery('unit', ['code'], [
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

const batchUpsertPerCode = batchUpsertQuery('unit', ['code'], [
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

const selectOneByCode = selectOneQuery('unit', ['code'], fields.concat(`ARRAY(${selectCommunitiesName}) AS communities`));

const selectByJanusAccountId = selectPageQuery(
    'unit JOIN janus_account_unit ON (unit.id = janus_account_unit.unit_id)',
    ['janus_account_id'],
    ['id', 'janus_account_id', 'code', 'index']
);

const selectByInistAccountId = selectPageQuery(
    'unit JOIN inist_account_unit ON (unit.id = inist_account_unit.unit_id)',
    ['inist_account_id'],
    ['id', 'inist_account_id', 'code', 'index']
);

const selectBy = selectPageQuery('unit', ['code'], ['id', 'code']);
const selectByIds = selectByOrderedFieldValuesQuery('unit', ['id'], ['id', 'code', 'name']);

export default {
    ...unitQueries,
    upsertOnePerCode,
    batchUpsertPerCode,
    selectOneByCode,
    selectByJanusAccountId,
    selectByInistAccountId,
    selectBy,
    selectByIds
};
