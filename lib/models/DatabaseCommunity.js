import databaseCommunityQueries from '../queries/databaseCommunityQueries';

function DatabaseCommunity(client) {
    const DatabaseCommunityClient = client.link(DatabaseCommunity.queries);

    const assignCommunityToDatabase = function* (communityIds, databaseId) {
        return yield DatabaseCommunityClient.batchUpsert(
            communityIds.map(communityId => ({
                community_id: communityId,
                database_id: databaseId,
            })),
        );
    };

    const unassignCommunityFromDatabase = function* (communityIds, databaseId) {
        return yield DatabaseCommunityClient.batchDelete(
            communityIds.map(communityId => ({
                community_id: communityId,
                database_id: databaseId,
            })),
        );
    };

    return {
        ...DatabaseCommunityClient,
        assignCommunityToDatabase,
        unassignCommunityFromDatabase,
    };
}

DatabaseCommunity.queries = databaseCommunityQueries;

export default DatabaseCommunity;
