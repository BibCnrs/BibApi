import subMinutes from 'date-fns/sub_minutes';
import {
    deleteEntriesCreatedBeforeThan,
    getHistories,
} from '../../../lib/models/History';

describe('model History', function () {
    describe('deleteEntriesCreatedBeforeThan', function () {
        beforeEach(function* () {
            yield fixtureLoader.createHistory({
                user_id: 'foo',
                event: '{ "foo": 42 }',
                created_at: subMinutes(new Date(), 200),
            });
            yield fixtureLoader.createHistory({
                user_id: 'foo',
                event: '{ "foo": 42 }',
            });
        });

        it('should remove history older than specified date', function* () {
            let entries = yield getHistories();
            assert.equal(entries.length, 2);
            yield deleteEntriesCreatedBeforeThan(subMinutes(new Date(), 5));

            entries = yield getHistories();
            assert.equal(entries.length, 1);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });
});
