import { crudQueries, batchUpsertQuery } from 'co-postgres-queries';

const janusAccountCommunityQueries = crudQueries(
    'janus_account_community',
    ['janus_account_id', 'community_id', 'index'],
    ['janus_account_id', 'community_id'],
    ['*'],
    [],
);
const batchUpsert = batchUpsertQuery(
    'janus_account_community',
    ['janus_account_id', 'community_id'],
    ['janus_account_id', 'community_id', 'index'],
    ['*'],
);

export default {
    ...janusAccountCommunityQueries,
    batchUpsert,
};
