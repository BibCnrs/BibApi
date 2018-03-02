import unitCommunityQueries from '../queries/unitCommunityQueries';

function UnitCommunity(client) {
    const unitCommunityClient = client.link(UnitCommunity.queries);

    const assignCommunityToUnit = function*(communityIds, unitId) {
        return yield unitCommunityClient.batchUpsert(
            communityIds.map((communityId, index) => ({
                community_id: communityId,
                unit_id: unitId,
                index,
            })),
        );
    };

    const unassignCommunityFromUnit = function*(communityIds, unitId) {
        return yield unitCommunityClient.batchDelete(
            communityIds.map(communityId => ({
                community_id: communityId,
                unit_id: unitId,
            })),
        );
    };

    return {
        ...unitCommunityClient,
        assignCommunityToUnit,
        unassignCommunityFromUnit,
    };
}

UnitCommunity.queries = unitCommunityQueries;

export default UnitCommunity;
