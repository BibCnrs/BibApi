import body from 'co-body';
import prisma from '../../prisma/prisma';
import {
    deleteAllHistoriesNotAlertForUser,
    deleteOne,
    disableHistory,
    enableHistory,
    getHistories,
    insertOne,
    selectOne,
} from '../../models/History';

export const postHistory = function* () {
    const { history: event } = yield body(this);
    const { id: user_id } = this.state.cookie;

    const entry = yield insertOne({ user_id, event });

    this.status = 200;
    this.body = entry;
};

export const deleteHistory = function* () {
    if (!this.query.id) {
        this.status = 404;
        return;
    }

    const id = JSON.parse(decodeURIComponent(this.query.id));

    yield deleteOne(id);

    this.status = 200;
};

export const enableOrDisableAlert = function* (historyId) {
    const history = yield selectOne(historyId);
    if (!history) {
        this.status = 404;
        return;
    }
    if (history.active === true) {
        yield disableHistory(historyId);
    } else {
        yield enableHistory(historyId);
    }
    this.status = 200;
    this.body = {
        ...history,
        active: !history.active,
    };
};

export const enableOrDisableAllAlert = function* () {
    const { id: user_id } = this.state.cookie;

    try {
        const firstUserAlert = yield getHistories({
            take: 1,
            filters: { user_id: user_id.toString(), has_alert: true },
        });

        // we update all user alert with the opposite value of the first one
        const active =
            firstUserAlert.length > 0 ? !firstUserAlert[0].active : true;

        yield prisma.history.updateMany({
            where: {
                has_alert: true,
                user_id: user_id.toString(),
            },
            data: {
                active,
            },
        });

        this.status = 200;
        this.body = {
            message: 'ok',
        };
    } catch (e) {
        this.status = 500;
        this.body = {
            message: e.message,
        };
    }

    return;
};

export const deleteHistories = function* () {
    const { id: user_id } = this.state.cookie;
    yield deleteAllHistoriesNotAlertForUser({
        user_id,
    });
    this.status = 200;
    this.body = {
        message: 'All histories deleted',
    };
};

const parseFrequence = (frequence) => {
    switch (frequence) {
        case '1 mon':
            return 'month';
        case '1 day':
            return 'day';
        case '7 days':
            return 'week';
        case '1 year':
            return 'year';
        default:
            return 'day';
    }
};

export const getHistory = function* () {
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

    const filters = {
        user_id: user_id.toString(),
    };

    if (has_alert) {
        filters.has_alert = has_alert === 'true';
    }

    // get historyEntris via queryRaw with frequence cast as string. Filter by user_id and has_alert if has_alert is defined
    const historyEntries = yield prisma.$queryRawUnsafe(
        `SELECT
            id,
            user_id,     
            event,          
            created_at,      
            has_alert,      
            frequence::text,      
            last_execution,  
            last_results,   
            nb_results,
            active          
            FROM history
            WHERE user_id = $1 
            ${has_alert ? 'AND has_alert = $4' : ''}
            ORDER BY created_at DESC
            LIMIT $2
            OFFSET $3
                `,
        user_id.toString(),
        limit,
        offset,
        has_alert === 'true',
    );
    const totalCount = yield prisma.history.count({ where: filters });

    this.body = historyEntries.map(
        ({ id, event, has_alert, frequence, active }) => {
            return {
                id,
                event,
                totalCount,
                hasAlert: has_alert,
                frequence: parseFrequence(frequence),
                active,
            };
        },
    );
};

export const countHistories = function* () {
    const { id: user_id } = this.state.cookie;
    const hasAlert = this.query.hasAlert || false;

    const numberHistories = yield countHistories(user_id, hasAlert);

    this.body = {
        count: numberHistories,
    };
    this.status = 200;
    return;
};
