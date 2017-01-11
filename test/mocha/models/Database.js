import Database from '../../../lib/models/Database';

describe('model Database', function () {
    let databaseQueries;

    before(function () {
        databaseQueries = Database(postgres);
    });

    describe('updateCommunities', function () {
        let database, insb, inc, inshs;

        beforeEach(function* () {
            [insb, inc, inshs] = yield ['insb', 'inc', 'inshs']
            .map(name => fixtureLoader.createCommunity({ name }));

            yield fixtureLoader.createDatabase({ name: 'marmelab', communities: [insb.id, inc.id]});
            database = yield postgres.queryOne({ sql: 'SELECT * FROM database WHERE name=$name', parameters: { name: 'marmelab' }});
        });

        it('should throw an error if trying to add a community which does not exists and abort modification', function* () {
            let error;
            try {
                yield databaseQueries.updateCommunities(['nemo', inshs.id], database.id);
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Communities nemo does not exists');

            const databaseCommunities = yield postgres.queries({
                sql: 'SELECT * FROM database_community WHERE database_id=$id',
                parameters: { id: database.id }
            });
            assert.deepEqual(databaseCommunities, [
                { database_id: database.id, community_id: insb.id },
                { database_id: database.id, community_id: inc.id }
            ]);
        });

        it('should add given new community', function* () {
            yield databaseQueries.updateCommunities([insb.id, inc.id, inshs.id], database.id);

            const databaseCommunities = yield postgres.queries({
                sql: 'SELECT * FROM database_community WHERE database_id=$id',
                parameters: { id: database.id }
            });
            assert.deepEqual(databaseCommunities, [
                { database_id: database.id, community_id: insb.id },
                { database_id: database.id, community_id: inc.id },
                { database_id: database.id, community_id: inshs.id }
            ]);
        });

        it('should remove missing community', function* () {
            yield databaseQueries.updateCommunities([insb.id], database.id);

            const databaseCommunities = yield postgres.queries({
                sql: 'SELECT * FROM database_community WHERE database_id=$id',
                parameters: { id: database.id }
            });
            assert.deepEqual(databaseCommunities, [
                { database_id: database.id, community_id: insb.id }
            ]);
        });

        it('should update community index', function* () {
            yield databaseQueries.updateCommunities([inc.id, insb.id], database.id);

            const databaseCommunities = yield postgres.queries({
                sql: 'SELECT * FROM database_community WHERE database_id=$id',
                parameters: { id: database.id }
            });
            assert.deepEqual(databaseCommunities, [
                { database_id: database.id, community_id: insb.id },
                { database_id: database.id, community_id: inc.id }
            ]);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

});
