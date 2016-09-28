import { crudQueries, batchUpsertQuery } from 'co-postgres-queries';

const userCommunityQueries = crudQueries('janus_account_community', ['janus_account_id', 'community_id', 'index'], ['janus_account_id', 'community_id'], ['*'], []);
const batchUpsertUserCommunityQuery = batchUpsertQuery('janus_account_community', ['janus_account_id', 'community_id'], ['janus_account_id', 'community_id', 'index'], ['*']);

export default (client) => {

    const queries = client.link(userCommunityQueries);
    const batchUpsert = client.link(batchUpsertUserCommunityQuery);

    queries.assignCommunityToUser = function* (communityIds, userId) {
        return yield batchUpsert(communityIds.map((communityId, index) => ({ community_id: communityId, janus_account_id: userId, index })));
    };

    queries.unassignCommunityFromUser = function* (communityIds, userId) {
        return yield queries.batchDelete(communityIds.map(communityId => ({ community_id: communityId, janus_account_id: userId })));
    };
    return queries;
};
