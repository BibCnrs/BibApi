import body from 'co-body';

export const postHistory = function*() {
    const { history: event } = yield body(this);
    const { id: user_id } = this.state.cookie;

    const entry = yield this.historyQueries.insertOne({ user_id, event });

    this.status = 200;
    this.body = entry;
};

export const deleteHistory = function*() {
    if (!this.query.id) {
        this.status = 404;
        return;
    }

    const id = JSON.parse(decodeURIComponent(this.query.id));

    yield this.historyQueries.deleteOne({ id });

    this.status = 200;
};

const parseFrequence = frequence => {
    if (!frequence) {
        return 'none';
    }

    if (frequence.months && frequence.months === 1) {
        return 'month';
    }

    if (frequence.days && frequence.days === 7) {
        return 'week';
    }

    if (frequence.years && frequence.years === 1) {
        return 'year';
    }

    if (frequence.days && frequence.days === 1) {
        return 'day';
    }

    return 'none';
};

export const getHistory = function*() {
    const { id: user_id } = this.state.cookie;
    let limit = 5;
    let offset = 0;

    if (this.query.limit) {
        limit = JSON.parse(decodeURIComponent(this.query.limit));
    }
    if (this.query.offset) {
        offset = JSON.parse(decodeURIComponent(this.query.offset));
    }

    const historyEntries = yield this.historyQueries.selectPage(
        limit,
        offset,
        { user_id },
        'created_at',
        'DESC',
    );

    this.body = historyEntries.map(
        ({ id, event, totalcount, has_alert, frequence }) => ({
            id,
            event,
            totalcount,
            hasAlert: has_alert,
            frequence: parseFrequence(frequence),
        }),
    );
};
