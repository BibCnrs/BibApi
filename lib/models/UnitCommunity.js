import { crudQueries, batchUpsertQuery } from 'co-postgres-queries';

const unitCommunityQueries = crudQueries('unit_community', ['unit_id', 'community_id', 'index'], ['unit_id', 'community_id'], ['*'], []);
const batchUpsertUnitCommunityQuery = batchUpsertQuery('unit_community', ['unit_id', 'community_id'], ['unit_id', 'community_id', 'index'], ['unit_id', 'community_id', 'index']);

export default (client) => {

    const queries = client.link(unitCommunityQueries);
    queries.batchUpsert = client.link(batchUpsertUnitCommunityQuery);

    queries.assignCommunityToUnit = function* (communityIds, unitId) {
        return yield queries.batchUpsert(communityIds.map((communityId, index) => ({ community_id: communityId, unit_id: unitId, index })));
    };

    queries.unassignCommunityFromUnit = function* (communityIds, unitId) {
        return yield queries.batchDelete(communityIds.map((communityId) => ({ community_id: communityId, unit_id: unitId })));
    };

    return queries;
};
