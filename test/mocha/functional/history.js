import subMinutes from 'date-fns/sub_minutes';

describe('/ebsco/history', function() {
    let janusAccount;
    let historyEntries = [];

    before(function*() {
        janusAccount = yield fixtureLoader.createJanusAccount({ uid: 'john' });

        historyEntries = yield Array.from(Array(12).keys()).map(key =>
            fixtureLoader.createHistory({
                user_id: janusAccount.id,
                created_at: subMinutes(new Date(), key),
            }),
        );
        historyEntries = historyEntries.sort(
            (h1, h2) => h2.created_at - h1.created_at,
        );
    });

    describe('GET', function() {
        it('should return first page of user history entries', function*() {
            request.setToken({ id: janusAccount.id, username: 'john' });
            const response = yield request.get('/ebsco/history');
            const historyEntriesFromServer = JSON.parse(response.body);
            const expected = historyEntries
                .slice(0, 5)
                .map(({ id, event, has_alert }) => ({
                    id,
                    event,
                    hasAlert: has_alert,
                    active: true,
                    frequence: 'day',
                    totalcount: '12',
                }));
            assert.deepEqual(historyEntriesFromServer, expected);
        });

        it('should return requested page of user history entries', function*() {
            request.setToken({ id: janusAccount.id, username: 'john' });
            const response = yield request.get('/ebsco/history?offset=10');
            const historyEntriesFromServer = JSON.parse(response.body);

            assert.deepEqual(
                historyEntriesFromServer,
                historyEntries
                    .slice(10, 13)
                    .map(({ id, event, has_alert }) => ({
                        id,
                        event,
                        hasAlert: has_alert,
                        active: true,
                        frequence: 'day',
                        totalcount: '12',
                    })),
            );
        });

        it('should disable an alert enabled', function*() {
            request.setToken({ id: janusAccount.id, username: 'john' });
            const responseFromPost = yield request.post(
                '/ebsco/history',
                {
                    history: { bar: 'foo2' },
                },
                null,
            );
            yield request.get(
                `/ebsco/history/disable/${responseFromPost.body.id}`,
            );

            const response = yield request.get('/ebsco/history');
            const historyEntriesFromServer = JSON.parse(response.body);

            assert.deepEqual(historyEntriesFromServer[0].active, false);
        });
    });

    describe('POST', function() {
        it('should save the history entry', function*() {
            request.setToken({ id: janusAccount.id, username: 'john' });
            yield request.post(
                '/ebsco/history',
                {
                    history: { bar: 'foo' },
                },
                null,
            );

            const response = yield request.get('/ebsco/history');
            const historyEntriesFromServer = JSON.parse(response.body);

            assert.deepEqual(historyEntriesFromServer[0].event, { bar: 'foo' });
        });
    });

    describe('DELETE', function() {
        it('should delete the history entry', function*() {
            request.setToken({ id: janusAccount.id, username: 'john' });
            const responseFromPost = yield request.post(
                '/ebsco/history',
                {
                    history: { bar: 'foo2' },
                },
                null,
            );
            yield request.DELETE(
                `/ebsco/history?id=${responseFromPost.body.id}`,
            );

            const response = yield request.get('/ebsco/history');
            const historyEntriesFromServer = JSON.parse(response.body);

            assert.deepEqual(historyEntriesFromServer[0].event, { bar: 'foo' });
        });
    });

    after(function*() {
        yield fixtureLoader.clear();
    });
});
