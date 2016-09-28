import { crudQueries, batchUpsertQuery } from 'co-postgres-queries';

const instituteCommunityQueries = crudQueries('institute_community', ['institute_id', 'community_id', 'index'], ['institute_id', 'community_id'], ['*'], []);
const batchUpsertInstituteCommunityQuery = batchUpsertQuery('institute_community', ['institute_id', 'community_id'], ['institute_id', 'community_id', 'index'], ['institute_id', 'community_id', 'index']);

export default (client) => {
    const queries = client.link(instituteCommunityQueries);
    const batchUpsertInstituteCommunity = client.link(batchUpsertInstituteCommunityQuery);

    queries.assignCommunityToInstitute = function* (communityIds, instituteId) {
        return yield batchUpsertInstituteCommunity(communityIds.map((communityId, index) => ({ community_id: communityId, institute_id: instituteId, index })));
    };

    queries.unassignCommunityFromInstitute = function* (communityIds, instituteId) {
        return yield queries.batchDelete(communityIds.map((communityId) => ({ community_id: communityId, institute_id: instituteId })));
    };

    return queries;
};
