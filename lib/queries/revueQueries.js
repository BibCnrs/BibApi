import { crudQueries } from 'co-postgres-queries';

const selectCommunities = `SELECT id
FROM community
JOIN revue_community ON (community.id = revue_community.community_id)
WHERE revue_community.revue_id = revue.id`;
const selectDomains = `SELECT name
FROM community
JOIN revue_community ON (community.id = revue_community.community_id)
WHERE revue_community.revue_id = revue.id`;

const returnFields = [
    'id',
    'title',
    'url',
    `ARRAY(${selectCommunities}) AS communities`,
    `ARRAY(${selectDomains}) AS domains`,
];

const crud = crudQueries('revue', ['title', 'url'], ['id'], returnFields, []);

crud.selectPage
    .table(
        'revue LEFT JOIN revue_community ON revue.id = revue_community.revue_id',
    )
    .groupByFields(['revue.id'])
    .returnFields(
        returnFields.map(field => {
            if (field.match(/ARRAY/)) {
                return field;
            }

            return `revue.${field}`;
        }),
    )
    .searchableFields(['revue.title', 'community_id']);

export default crud;
