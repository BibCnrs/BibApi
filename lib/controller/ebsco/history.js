import body from 'co-body';

export const postHistory = function* () {
    const { history: event } = yield body(this);
    const { id: user_id } = this.state.cookie;

    yield this.historyQueries.insertOne({ user_id, event });

    this.status = 200;
};

export const getHistory = function* () {
    const { id: user_id } = this.state.cookie;
    let limit = 20;
    let offset = 0;

    if (this.query.limit) {
        limit = JSON.parse(decodeURIComponent(this.query.limit));
    }
    if (this.query.offset) {
        offset = JSON.parse(decodeURIComponent(this.query.offset));
    }

    const historyEntries = yield this.historyQueries.selectPage(limit, offset, { user_id }, 'timestamp', 'DESC');

    this.body = historyEntries.map(({ event, totalcount }) => ({ event, totalcount }));
};