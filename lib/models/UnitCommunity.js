import { crud, batchUpsert } from 'co-postgres-queries';

const unitCommunityQueries = crud('unit_community', ['unit_id', 'community_id', 'index'], ['unit_id', 'community_id'], ['*'], []);
const batchUpsertQuery = batchUpsert('unit_community', ['unit_id', 'community_id'], ['unit_id', 'community_id', 'index'], ['unit_id', 'community_id', 'index']);

export default (client) => {

    const queries = unitCommunityQueries(client);
    queries.batchUpsert = batchUpsertQuery(client);

    queries.assignCommunityToUnit = function* (communityIds, unitId) {
        return yield queries.batchUpsert(communityIds.map((communityId, index) => ({ community_id: communityId, unit_id: unitId, index })));
    };

    queries.unassignCommunityFromUnit = function* (communityIds, unitId) {
        return yield queries.batchDelete(communityIds.map((communityId) => ({ community_id: communityId, unit_id: unitId })));
    };

    return queries;
};
