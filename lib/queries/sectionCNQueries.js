import {
    crudQueries,
    selectPageQuery,
    selectByOrderedFieldValuesQuery,
} from 'co-postgres-queries';

const selectPrimaryInstitute = `SELECT institute_id 
FROM section_cn_primary_institute
WHERE section_cn_primary_institute.section_cn_id = section_cn.id`;

const selectSecondaryInstitutes = `SELECT institute_id 
FROM section_cn_secondary_institute
WHERE section_cn_secondary_institute.section_cn_id = section_cn.id`;

const returnFields = [
    'id',
    'name',
    'code',
    'comment',
    `ARRAY(${selectPrimaryInstitute}) AS primary_institutes`,
    `ARRAY(${selectSecondaryInstitutes}) AS secondary_institutes`,
];

const adminReturnFields = [
    ...returnFields,
    `ARRAY(${selectPrimaryInstitute}) AS primary_institutes`,
    `ARRAY(${selectSecondaryInstitutes}) as secondary_institutes`,
];

const sectionCNQueries = crudQueries(
    'section_cn',
    ['name', 'code', 'comment'],
    ['id'],
    ['id', 'name', 'code', 'comment'],
);

sectionCNQueries.selectOne.returnFields(adminReturnFields);

sectionCNQueries.selectPage
    .groupByFields(['section_cn.id'])
    .returnFields(
        adminReturnFields.map((field) => {
            if (field.match(/ARRAY/)) {
                return field;
            }

            return `section_cn.${field}`;
        }),
    )
    .searchableFields([
        'section_cn.id',
        'section_cn.name',
        'section_cn.code',
        'section_cn.comment',
    ]);

const selectByUnitId = selectPageQuery(
    'section_cn JOIN unit_section_cn ON (section_cn.id = unit_section_cn.section_cn_id)',
    ['unit_id'],
    ['id', 'unit_id', 'code', 'name', 'index'],
);
const selectByIds = selectByOrderedFieldValuesQuery('section_cn', 'id', [
    'id',
    'code',
    'name',
]);
const selectBy = selectPageQuery(
    'section_cn',
    ['name'],
    ['id', 'code', 'name'],
);

const primaryInstitutesJoin =
    'LEFT JOIN section_cn_primary_institute AS primary_institute ON primary_institute.section_cn_id = section_cn.id';
const secondaryInstitutesJoin =
    'LEFT JOIN section_cn_secondary_institute AS secondary_institute ON secondary_institute.section_cn_id = section_cn.id';

// define join to add for query to be able to filter on certain field
const filtersJoin = {
    'primary_institute.institute_id': primaryInstitutesJoin,
    'secondary_institute.institute_id': secondaryInstitutesJoin,
};

export default {
    ...sectionCNQueries,
    selectByUnitId,
    selectByIds,
    filtersJoin,
    selectBy,
};
