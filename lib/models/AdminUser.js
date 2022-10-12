import prisma from '../../prisma/prisma';
import { hashPassword, generateSalt } from '../services/passwordHash';
const DEFAULT_TABLE = 'admin_user';
import co from 'co';

export const selectOne = function* (id) {
    return yield prisma[DEFAULT_TABLE].findUnique({
        where: {
            id: parseInt(id),
        },
    });
};

export const selectOneByUsername = function* (username) {
    return yield prisma[DEFAULT_TABLE].findUnique({
        where: {
            username: username,
        },
    });
};

export const insertOne = function* (data) {
    if (data.password) {
        data.salt = yield generateSalt();
        data.password = yield hashPassword(data.password, data.salt);
    }
    return yield prisma[DEFAULT_TABLE].create({
        data: data,
    });
};

export const insertMany = function* (data) {
    const preparedUsers = yield data.map((user) =>
        co(function* () {
            if (user.password) {
                user.salt = yield generateSalt();
                user.password = yield hashPassword(user.password, user.salt);
            }

            return user;
        }),
    );
    return yield prisma[DEFAULT_TABLE].createMany({
        data: preparedUsers,
    });
};

export const updateOne = function* (id, data) {
    let modifiedEntity;
    try {
        if (data.password) {
            data.salt = yield generateSalt();
            data.password = yield hashPassword(data.password, data.salt);
        }

        modifiedEntity = yield prisma[DEFAULT_TABLE].update({
            where: {
                id: parseInt(id),
            },
            data: data,
        });
    } catch (e) {
        if (e.message === 'not found') {
            this.status = 404;
            return;
        }

        throw e;
    }

    return modifiedEntity;
};
