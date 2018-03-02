import {
    crudQueries,
    selectOneQuery,
    selectPageQuery,
    selectByOrderedFieldValuesQuery,
    upsertOneQuery,
} from 'co-postgres-queries';

const selectCommunities = `SELECT id
FROM community
JOIN institute_community ON (community.id = institute_community.community_id)
WHERE institute_community.institute_id = institute.id
ORDER BY index ASC`;

const selectCommunitiesName = `SELECT name
FROM community
JOIN institute_community ON (community.id = institute_community.community_id)
WHERE institute_community.institute_id = institute.id
ORDER BY index ASC`;

const instituteQueries = crudQueries(
    'institute',
    ['code', 'name'],
    ['id'],
    ['id', 'code', 'name'],
);
instituteQueries.selectOne.returnFields([
    'id',
    'code',
    'name',
    `ARRAY(${selectCommunities}) AS communities`,
]);

instituteQueries.selectPage
    .groupByFields(['institute.id'])
    .searchableFields(['institute.id', 'institute.code', 'institute.name'])
    .returnFields([
        'institute.id',
        'institute.code',
        'institute.name',
        `ARRAY(${selectCommunities}) AS communities`,
    ]);

const selectByJanusAccountId = selectPageQuery(
    'institute JOIN janus_account_institute ON (institute.id = janus_account_institute.institute_id)',
    ['janus_account_id'],
    ['id', 'janus_account_id', 'code', 'name', 'index'],
);

const selectByInistAccountId = selectPageQuery(
    'institute JOIN inist_account_institute ON (institute.id = inist_account_institute.institute_id)',
    ['inist_account_id'],
    ['id', 'inist_account_id', 'code', 'name', 'index'],
);

const selectByUnitId = selectPageQuery(
    'institute JOIN unit_institute ON (institute.id = unit_institute.institute_id)',
    ['unit_id'],
    ['id', 'unit_id', 'code', 'name', 'index'],
);

const selectPrimaryBySectionCNId = selectPageQuery(
    'institute JOIN section_cn_primary_institute ON (institute.id = section_cn_primary_institute.institute_id)',
    ['institute_id'],
    ['id', 'institute_id', 'code', 'name'],
);

const selectSecondaryBySectionCNId = selectPageQuery(
    'institute JOIN section_cn_secondary_institute ON (institute.id = section_cn_secondary_institute.institute_id)',
    ['institute_id'],
    ['id', 'institute_id', 'code', 'name'],
);

const selectBy = selectPageQuery('institute', ['name'], ['id', 'code', 'name']);
const selectByIds = selectByOrderedFieldValuesQuery('institute', 'id', [
    'id',
    'code',
    'name',
]);

const upsertOnePerCode = upsertOneQuery('institute', ['code'], ['name']);
const selectOneByCode = selectOneQuery(
    'institute',
    ['code'],
    ['id', 'code', 'name', `ARRAY(${selectCommunitiesName}) AS communities`],
);

const communityJoin = `LEFT JOIN institute_community ON institute_community.institute_id = institute.id
LEFT JOIN community ON community.id = institute_community.community_id`;

const filtersJoin = {
    'community.id': communityJoin,
};

export default {
    ...instituteQueries,
    selectByJanusAccountId,
    selectByInistAccountId,
    selectByUnitId,
    selectPrimaryBySectionCNId,
    selectSecondaryBySectionCNId,
    selectBy,
    selectByIds,
    upsertOnePerCode,
    selectOneByCode,
    filtersJoin,
};
