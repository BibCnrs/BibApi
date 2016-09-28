import { crudQueries, batchUpsertQuery } from 'co-postgres-queries';

const inistAccountCommunityQueries = crudQueries('inist_account_community', ['inist_account_id', 'community_id', 'index'], ['inist_account_id', 'community_id'], ['*'], []);
const batchUpsertInistAccountCommunityQuery = batchUpsertQuery('inist_account_community', ['inist_account_id', 'community_id'], ['inist_account_id', 'community_id', 'index']);

export default (client) => {
    const queries = client.link(inistAccountCommunityQueries);
    queries.batchUpsert = client.link(batchUpsertInistAccountCommunityQuery);

    queries.assignCommunityToInistAccount = function* (communityIds, inistAccountId) {
        return yield queries.batchUpsert(communityIds.map((communityId, index) => ({ community_id: communityId, inist_account_id: inistAccountId, index })));
    };

    queries.unassignCommunityFromInistAccount = function* (communityIds, inistAccountId) {
        return yield queries.batchDelete(communityIds.map(communityId => ({ community_id: communityId, inist_account_id: inistAccountId })));
    };

    return queries;
};
