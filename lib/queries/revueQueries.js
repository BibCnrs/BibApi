import { crudQueries } from 'co-postgres-queries';

const selectCommunities = `SELECT id
FROM community
JOIN revue_community ON (community.id = revue_community.community_id)
WHERE revue_community.revue_id = revue.id`;
const selectDomains = `SELECT name
FROM community
JOIN revue_community ON (community.id = revue_community.community_id)
WHERE revue_community.revue_id = revue.id`;
const selectGates = `SELECT gate
FROM community
JOIN revue_community ON (community.id = revue_community.community_id)
WHERE revue_community.revue_id = revue.id`;

const returnFields = [
    'id',
    'title',
    'url',
    `ARRAY(${selectCommunities}) AS communities`,
    `ARRAY(${selectGates}) AS gates`,
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

crud.selectRevueByDomains = domains => ({
    sql: `SELECT title, url, community.gate as gate
FROM revue
    JOIN revue_community ON (revue.id = revue_community.revue_id)
    JOIN community ON (revue_community.community_id = community.id)
JOIN (
VALUES ${domains.map((_, index) => `($domain${index + 1}, ${index + 1})`)}
) AS x (name, ordering)
ON community.name::varchar=x.name
ORDER BY x.ordering;`,
    parameters: domains.reduce(
        (acc, name, index) => ({
            ...acc,
            [`domain${index + 1}`]: name,
        }),
        {},
    ),
});

export default crud;
