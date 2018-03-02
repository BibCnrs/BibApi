import { crudQueries, batchUpsertQuery } from 'co-postgres-queries';

const inistAccountCommunityQueries = crudQueries(
    'inist_account_community',
    ['inist_account_id', 'community_id', 'index'],
    ['inist_account_id', 'community_id'],
    ['*'],
    [],
);

const batchUpsert = batchUpsertQuery(
    'inist_account_community',
    ['inist_account_id', 'community_id'],
    ['inist_account_id', 'community_id', 'index'],
);

export default {
    ...inistAccountCommunityQueries,
    batchUpsert,
};
