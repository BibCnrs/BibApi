import co from 'co';

import {
    isPasswordValid,
    hashPassword,
    generateSalt,
} from '../services/passwordHash';
import adminUserQueries from '../queries/adminUserQueries';

function AdminUser(client) {
    const adminUserClient = client.link(AdminUser.queries);

    const insertOne = function* insertOne(user) {
        if (user.password) {
            user.salt = yield generateSalt();
            user.password = yield hashPassword(user.password, user.salt);
        }

        return yield adminUserClient.insertOne(user);
    };

    const updateOne = function* updateOne(id, user) {
        if (user.password) {
            user.salt = yield generateSalt();
            user.password = yield hashPassword(user.password, user.salt);
        }

        return yield adminUserClient.updateOne(id, user);
    };

    const batchInsert = function* batchInsert(users) {
        const preparedUsers = yield users.map(user =>
            co(function* () {
                if (user.password) {
                    user.salt = yield generateSalt();
                    user.password = yield hashPassword(
                        user.password,
                        user.salt,
                    );
                }

                return user;
            }),
        );

        return yield adminUserClient.batchInsert(preparedUsers);
    };

    const authenticate = function* authenticate(username, password) {
        const foundUser = yield adminUserClient.selectOneByUsername(username);
        if (
            !foundUser ||
            !(yield isPasswordValid(
                password,
                foundUser.salt,
                foundUser.password,
            ))
        ) {
            return false;
        }

        return foundUser;
    };

    return {
        ...adminUserClient,
        insertOne,
        updateOne,
        batchInsert,
        authenticate,
    };
}

AdminUser.queries = adminUserQueries;

export default AdminUser;
