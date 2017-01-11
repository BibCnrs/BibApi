import body from 'co-body';

export const postHistory = function* () {
    const { history: event } = yield body(this);
    const { id: user_id } = this.state.cookie;

    yield this.historyQueries.insertOne({ user_id, event });

    this.status = 200;
};
