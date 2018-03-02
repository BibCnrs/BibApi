import databaseQueries from '../queries/databaseQueries';
import DatabaseCommunity from './DatabaseCommunity';
import Community from './Community';
import entityAssigner from './entityAssigner';

function Database(client) {
    const databaseClient = client.link(Database.queries);

    const databaseCommunityClient = DatabaseCommunity(client);
    const communityClient = Community(client);

    const updateCommunities = entityAssigner(
        communityClient.selectByIds,
        communityClient.selectByDatabaseId,
        databaseCommunityClient.unassignCommunityFromDatabase,
        databaseCommunityClient.assignCommunityToDatabase,
    );

    const insertOne = function* insertOne(database) {
        try {
            yield client.begin();
            const insertedDatabase = yield databaseClient.insertOne(database);
            const communities = yield updateCommunities(
                database.communities,
                insertedDatabase.id,
            );

            yield client.commit();

            return {
                ...insertedDatabase,
                communities,
            };
        } catch (error) {
            yield client.rollback();
            throw error;
        }
    };

    const updateOne = function*(selector, inistAccount) {
        try {
            yield client.begin();

            let updatedDatabase;
            try {
                updatedDatabase = yield databaseClient.updateOne(
                    selector,
                    inistAccount,
                );
            } catch (error) {
                if (error.message !== 'no valid column to set') {
                    throw error;
                }
                updatedDatabase = yield databaseClient.selectOne({
                    id: selector,
                });
            }
            const communities = yield updateCommunities(
                inistAccount.communities,
                updatedDatabase.id,
            );

            yield client.commit();

            return {
                ...updatedDatabase,
                communities,
            };
        } catch (error) {
            yield client.rollback();
            throw error;
        }
    };

    return {
        ...databaseClient,
        updateCommunities,
        insertOne,
        updateOne,
    };
}

Database.queries = databaseQueries;

export default Database;
