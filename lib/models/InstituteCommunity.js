import instituteCommunityQueries from '../queries/instituteCommunityQueries';

function InstituteCommunity (client) {
    const instituteCommunityClient = client.link(InstituteCommunity.queries);

    const assignCommunityToInstitute = function* (communityIds, instituteId) {
        return yield instituteCommunityClient.batchUpsert(communityIds.map((communityId, index) => ({ community_id: communityId, institute_id: instituteId, index })));
    };

    const unassignCommunityFromInstitute = function* (communityIds, instituteId) {
        return yield instituteCommunityClient.batchDelete(communityIds.map((communityId) => ({ community_id: communityId, institute_id: instituteId })));
    };

    return {
        ...instituteCommunityClient,
        assignCommunityToInstitute,
        unassignCommunityFromInstitute
    };
}

InstituteCommunity.queries = instituteCommunityQueries;

export default InstituteCommunity;
