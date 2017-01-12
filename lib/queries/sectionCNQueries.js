import { crudQueries } from 'co-postgres-queries';

const selectPrimaryInstitutes = (
`SELECT institute_id
FROM section_cn_primary_institute
WHERE section_cn_primary_institute.section_cn_id = section_cn.id`
);

const selectSecondaryInstitutes = (
`SELECT institute_id
FROM section_cn_secondary_institute
WHERE section_cn_secondary_institute.section_cn_id = section_cn.id`
);

const returnFields = [
    'id',
    'name',
    'code',
    'comment',
    `ARRAY(${selectPrimaryInstitutes}) AS primary_institutes`,
    `ARRAY(${selectSecondaryInstitutes}) AS secondary_institutes`,
];

const adminReturnFields = [
    ...returnFields,
    `ARRAY(${selectPrimaryInstitutes}) as primary_institutes`,
    `ARRAY(${selectSecondaryInstitutes}) as secondary_institutes`,
];

const sectionCNQueries = crudQueries('section_cn', [
    'name',
    'code',
    'comment',
], ['id'], [
    'id',
    'name',
    'code',
    'comment',
]);

sectionCNQueries.selectOne.returnFields(adminReturnFields);

sectionCNQueries.selectPage
.groupByFields(['section_cn.id'])
.returnFields(adminReturnFields.map(field => {
    if(field.match(/ARRAY/)) {
        return field;
    }

    return `section_cn.${field}`;
}))
.searchableFields([
    'section_cn.id',
    'section_cn.name',
    'section_cn.code',
    'section_cn.comment',
]);

const primaryInstitutesJoin = 'LEFT JOIN section_cn_primary_institute AS primary_institutes ON section_cn_primary_institute.section_cn_id = section_cn.id';
const secondaryInstitutesJoin = 'LEFT JOIN section_cn_secondary_institute AS secondary_institutes ON section_cn_secondary_institute.section_cn_id = section_cn.id';

// define join to add for query to be able to filter on certain field
const filtersJoin = {
    'primary_institutes.institute_id': primaryInstitutesJoin,
    'secondary_institutes.institute_id': secondaryInstitutesJoin,
};

export default {
    ...sectionCNQueries,
    filtersJoin,
};
