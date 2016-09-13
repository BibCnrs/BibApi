import { crud, batchUpsert } from 'co-postgres-queries';

const instituteCommunityQueries = crud('institute_community', ['institute_id', 'community_id', 'index'], ['institute_id', 'community_id'], ['*'], []);
const batchUpsertQuery = batchUpsert('institute_community', ['institute_id', 'community_id'], ['institute_id', 'community_id', 'index'], ['institute_id', 'community_id', 'index']);

export default (client) => {
    const queries = instituteCommunityQueries(client);
    const batchUpsert = batchUpsertQuery(client);

    queries.assignCommunityToInstitute = function* (communityIds, instituteId) {
        return yield batchUpsert(communityIds.map((communityId, index) => ({ community_id: communityId, institute_id: instituteId, index })));
    };

    queries.unassignCommunityFromInstitute = function* (communityIds, instituteId) {
        return yield queries.batchDelete(communityIds.map((communityId) => ({ community_id: communityId, institute_id: instituteId })));
    };

    return queries;
};
