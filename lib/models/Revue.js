import revueQueries from '../queries/revueQueries';
import RevueCommunity from './RevueCommunity';
import Community from './Community';
import entityAssigner from './entityAssigner';

function Revue(client) {
    const revueClient = client.link(Revue.queries);

    const RevueCommunityClient = RevueCommunity(client);
    const communityClient = Community(client);

    const updateCommunities = entityAssigner(
        communityClient.selectByIds,
        communityClient.selectByRevueId,
        RevueCommunityClient.unassignCommunityFromRevue,
        RevueCommunityClient.assignCommunityToRevue,
    );

    const insertOne = function* insertOne(revue) {
        try {
            yield client.begin();
            const insertedRevue = yield revueClient.insertOne(revue);
            const communities = yield updateCommunities(
                revue.communities,
                insertedRevue.id,
            );

            yield client.commit();

            return {
                ...insertedRevue,
                communities,
            };
        } catch (error) {
            yield client.rollback();
            throw error;
        }
    };

    const updateOne = function*(selector, revue) {
        try {
            yield client.begin();

            let updatedRevue;
            try {
                updatedRevue = yield revueClient.updateOne(selector, revue);
            } catch (error) {
                if (error.message !== 'no valid column to set') {
                    throw error;
                }
                updatedRevue = yield revueClient.selectOne({
                    id: selector,
                });
            }
            const communities = yield updateCommunities(
                revue.communities,
                updatedRevue.id,
            );

            yield client.commit();

            return {
                ...updatedRevue,
                communities,
            };
        } catch (error) {
            yield client.rollback();
            throw error;
        }
    };

    return {
        ...revueClient,
        updateCommunities,
        insertOne,
        updateOne,
    };
}

Revue.queries = revueQueries;

export default Revue;
