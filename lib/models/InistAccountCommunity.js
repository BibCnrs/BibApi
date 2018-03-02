import inistAccountCommunityQueries from '../queries/inistAccountCommunityQueries';

function InistAccountCommunity(client) {
    const InistAccountCommunityClient = client.link(
        InistAccountCommunity.queries,
    );

    const assignCommunityToInistAccount = function*(
        communityIds,
        inistAccountId,
    ) {
        return yield InistAccountCommunityClient.batchUpsert(
            communityIds.map((communityId, index) => ({
                community_id: communityId,
                inist_account_id: inistAccountId,
                index,
            })),
        );
    };

    const unassignCommunityFromInistAccount = function*(
        communityIds,
        inistAccountId,
    ) {
        return yield InistAccountCommunityClient.batchDelete(
            communityIds.map(communityId => ({
                community_id: communityId,
                inist_account_id: inistAccountId,
            })),
        );
    };

    return {
        ...InistAccountCommunityClient,
        assignCommunityToInistAccount,
        unassignCommunityFromInistAccount,
    };
}

InistAccountCommunity.queries = inistAccountCommunityQueries;

export default InistAccountCommunity;
