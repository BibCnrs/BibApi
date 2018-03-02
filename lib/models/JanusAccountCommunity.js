import janusAccountCommunityQueries from '../queries/janusAccountCommunityQueries';

function JanusAccountCommunity(client) {
    const janusAccountCommunityClient = client.link(
        JanusAccountCommunity.queries,
    );

    const assignCommunityToJanusAccount = function*(communityIds, userId) {
        return yield janusAccountCommunityClient.batchUpsert(
            communityIds.map((communityId, index) => ({
                community_id: communityId,
                janus_account_id: userId,
                index,
            })),
        );
    };

    const unassignCommunityFromJanusAccount = function*(communityIds, userId) {
        return yield janusAccountCommunityClient.batchDelete(
            communityIds.map(communityId => ({
                community_id: communityId,
                janus_account_id: userId,
            })),
        );
    };

    return {
        ...janusAccountCommunityClient,
        assignCommunityToJanusAccount,
        unassignCommunityFromJanusAccount,
    };
}

JanusAccountCommunity.queries = janusAccountCommunityQueries;

export default JanusAccountCommunity;
