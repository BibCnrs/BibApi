import revueCommunityQueries from '../queries/revueCommunityQueries';

function RevueCommunity(client) {
    const RevueCommunityClient = client.link(RevueCommunity.queries);

    const assignCommunityToRevue = function* (communityIds, revueId) {
        return yield RevueCommunityClient.batchUpsert(
            communityIds.map(communityId => ({
                community_id: communityId,
                revue_id: revueId,
            })),
        );
    };

    const unassignCommunityFromRevue = function* (communityIds, revueId) {
        return yield RevueCommunityClient.batchDelete(
            communityIds.map(communityId => ({
                community_id: communityId,
                revue_id: revueId,
            })),
        );
    };

    return {
        ...RevueCommunityClient,
        assignCommunityToRevue,
        unassignCommunityFromRevue,
    };
}

RevueCommunity.queries = revueCommunityQueries;

export default RevueCommunity;
