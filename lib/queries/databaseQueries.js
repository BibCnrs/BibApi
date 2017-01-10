import { crudQueries } from 'co-postgres-queries';

const selectCommunities = (
`SELECT id
FROM community
JOIN database_community ON (community.id = database_community.community_id)
WHERE database_community.database_id = database.id`
);
const selectDomains = (
`SELECT name
FROM community
JOIN database_community ON (community.id = database_community.community_id)
WHERE database_community.database_id = database.id`
);


const returnFields = [
    'id',
    'name',
    'text_fr',
    'text_en',
    'url_fr',
    'url_en',
    'image',
    `ARRAY(${selectCommunities}) AS communities`,
    `ARRAY(${selectDomains}) AS domains`,
];

const crud = crudQueries(
    'database',
    ['name', 'text_fr', 'text_en', 'url_fr', 'url_en', 'image'],
    ['id'],
    returnFields,
    []
);

crud.selectPage
.table('database LEFT JOIN database_community ON database.id = database_community.database_id')
.groupByFields(['database.id'])
.returnFields(returnFields.map(field => {
    if(field.match(/ARRAY/)) {
        return field;
    }

    return `database.${field}`;
}))
.searchableFields([
    'database.name',
    'community_id',
]);

export default crud;
