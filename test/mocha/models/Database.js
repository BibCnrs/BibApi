import { updateCommunities } from '../../../lib/models/Database';
import prisma from '../../../lib/prisma/prisma';

describe('model Database', function () {
    describe('updateCommunities', function () {
        let database, insb, inc, inshs;

        beforeEach(function* () {
            insb = yield fixtureLoader.createCommunity({ name: 'insb' });
            inc = yield fixtureLoader.createCommunity({ name: 'inc' });
            inshs = yield fixtureLoader.createCommunity({ name: 'inshs' });

            yield fixtureLoader.createDatabase({
                name_fr: 'marmelab',
                name_en: 'marmelab US',
                communities: [insb.id, inc.id],
            });
            database = yield prisma.database.findUnique({
                where: { name_fr: 'marmelab' },
            });
        });

        it('should throw an error if trying to add a community which does not exists and abort modification', function* () {
            let error;
            try {
                yield updateCommunities([1500, inshs.id], database.id);
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Communities 1500 does not exists');

            // const databaseCommunities = yield postgres.queries({
            //     sql: 'SELECT * FROM database_community WHERE database_id=$id',
            //     parameters: { id: database.id },
            // });
            const databaseCommunities =
                yield prisma.database_community.findMany({
                    where: { database_id: database.id },
                });

            assert.deepEqual(databaseCommunities, [
                {
                    database_id: database.id,
                    community_id: insb.id,
                },
                {
                    database_id: database.id,
                    community_id: inc.id,
                },
            ]);
        });

        it('should add given new community', function* () {
            yield updateCommunities([insb.id, inc.id, inshs.id], database.id);

            const databaseCommunities =
                yield prisma.database_community.findMany({
                    where: { database_id: database.id },
                });
            assert.deepEqual(databaseCommunities, [
                {
                    database_id: database.id,
                    community_id: insb.id,
                },
                {
                    database_id: database.id,
                    community_id: inc.id,
                },
                {
                    database_id: database.id,
                    community_id: inshs.id,
                },
            ]);
        });

        it('should remove missing community', function* () {
            yield updateCommunities([insb.id], database.id);

            const databaseCommunities =
                yield prisma.database_community.findMany({
                    where: { database_id: database.id },
                });
            assert.deepEqual(databaseCommunities, [
                {
                    database_id: database.id,
                    community_id: insb.id,
                },
            ]);
        });

        it('should update community index', function* () {
            yield updateCommunities([inc.id, insb.id], database.id);

            const databaseCommunities =
                yield prisma.database_community.findMany({
                    where: { database_id: database.id },
                });
            assert.deepEqual(databaseCommunities, [
                {
                    database_id: database.id,
                    community_id: insb.id,
                },
                {
                    database_id: database.id,
                    community_id: inc.id,
                },
            ]);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });
});
