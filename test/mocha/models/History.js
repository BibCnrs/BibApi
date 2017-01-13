import subMinutes from 'date-fns/sub_minutes';
import History from '../../../lib/models/History';

describe('model History', function () {
    let historyQueries;

    before(function () {
        historyQueries = History(postgres);
    });

    describe('deleteEntriesCreatedBeforeThan', function () {
        beforeEach(function* () {
            yield fixtureLoader.createHistory({ user_id: 'foo', event: '{ "foo": 42 }', created_at: subMinutes(new Date, 200) });
            yield fixtureLoader.createHistory({ user_id: 'foo', event: '{ "foo": 42 }' });
        });

        it('should remove history older than specified date', function* () {
            let entries = yield historyQueries.selectPage();
            assert.equal(entries.length, 2);
            yield historyQueries.deleteEntriesCreatedBeforeThan(subMinutes(new Date(), 5));

            entries = yield historyQueries.selectPage();
            assert.equal(entries.length, 1);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

});
