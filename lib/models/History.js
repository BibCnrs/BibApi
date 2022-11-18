import prisma from '../prisma/prisma';

export const getHistories = function* (options = {}) {
    const { offset, take, order, filters } = options;

    return yield prisma.history.findMany({
        skip: offset,
        take,
        orderBy: order,
        where: filters,
    });
};

export const selectOne = function* (id) {
    return yield prisma.history.findUnique({
        where: {
            id: parseInt(id),
        },
    });
};

export const insertOne = function* (data) {
    if (data.user_id) {
        data.user_id = data.user_id.toString();
    }
    return yield prisma.history.create({
        data,
    });
};

export const updateOne = function* (id, data) {
    return yield prisma.history.update({
        where: {
            id: parseInt(id),
        },
        data,
    });
};

export const deleteOne = function* (id) {
    return yield prisma.history.delete({
        where: {
            id: parseInt(id),
        },
    });
};

export const deleteEntriesCreatedBeforeThan = function* (oldestDate) {
    return yield prisma.$queryRaw`WITH deleted AS (DELETE FROM history WHERE has_alert is false AND created_at < ${oldestDate}::timestamp RETURNING *) SELECT count(*) FROM deleted;`;
};

export const selectAlertToExecute = function* ({ date, limit }) {
    return yield prisma.$queryRawUnsafe(
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
        WHERE last_execution + frequence <= $1::date 
        AND has_alert IS true 
        AND active IS true 
        LIMIT $2
    `,
        date,
        limit,
    );
};

export const countAlertToExecute = function* ({ date }) {
    return yield prisma.$queryRaw`SELECT count(*) FROM history WHERE last_execution + frequence <= ${date}::date AND has_alert IS true AND active IS true`;
};

export const deleteAllHistoriesNotAlertForUser = function* ({ user_id }) {
    return yield prisma.$queryRaw`DELETE FROM history WHERE user_id = ${user_id.toString()} AND has_alert = false`;
};

export const enableHistory = function* (id) {
    return yield prisma.history.update({
        where: {
            id: parseInt(id),
        },
        data: {
            active: true,
        },
    });
};

export const disableHistory = function* (id) {
    return yield prisma.history.update({
        where: {
            id: parseInt(id),
        },
        data: {
            active: false,
        },
    });
};

export const enableOrDisableAllAlert = function* (activeValue, user_id) {
    return yield prisma.history.updateMany({
        where: {
            has_alert: true,
            user_id: parseInt(user_id),
        },
        data: {
            active: activeValue,
        },
    });
};

export const countHistories = function* (user_id, has_alert) {
    return yield prisma.history.count({
        where: {
            has_alert,
            user_id: parseInt(user_id),
        },
    });
};
