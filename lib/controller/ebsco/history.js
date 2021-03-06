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

export const enableOrDisableAlert = function*(historyId) {
    const history = yield this.historyQueries.selectOne(historyId);
    if (!history) {
        this.status = 404;
        return;
    }
    if (history.active === true) {
        yield this.historyQueries.disableHistory(historyId);
    } else {
        yield this.historyQueries.enableHistory(historyId);
    }
    this.status = 200;
    this.body = {
        ...history,
        active: !history.active,
    };
};

export const enableOrDisableAllAlert = function*() {
    const { id: user_id } = this.state.cookie;
    const histories = yield this.historyQueries.selectPage(null, null, {
        has_alert: true,
        user_id,
    });
    if (histories && histories.length > 0) {
        yield this.historyQueries.enableOrDisableAllAlert(
            !histories[0].active,
            user_id,
        );
        const historiesModified = histories.forEach(
            history => history.active === !!histories[0].active,
        );
        this.status = 200;
        this.body = historiesModified;
        return;
    }
    this.status = 404;
    return;
};

export const deleteHistories = function*() {
    const { id: user_id } = this.state.cookie;
    yield this.historyQueries.deleteAllHistoriesNotAlertForUser({ user_id });
    this.status = 200;
};

const parseFrequence = frequence => {
    if (!frequence) {
        return 'day';
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

    return 'day';
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
    const has_alert = this.query.has_alert;

    const historyEntries = yield this.historyQueries.selectPage(
        limit,
        offset,
        has_alert
            ? {
                  user_id,
                  has_alert,
              }
            : {
                  user_id,
              },
        'created_at',
        'DESC',
    );

    this.body = historyEntries.map(
        ({ id, event, totalcount, has_alert, frequence, active }) => ({
            id,
            event,
            totalcount,
            hasAlert: has_alert,
            frequence: parseFrequence(frequence),
            active,
        }),
    );
};

export const countHistories = function*() {
    const { id: user_id } = this.state.cookie;
    const hasAlert = this.query.hasAlert || false;

    const numberHistories = yield this.historyQueries.countHistories(
        user_id,
        hasAlert,
    );

    this.body = {
        count: numberHistories,
    };
    this.status = 200;
    return;
};
