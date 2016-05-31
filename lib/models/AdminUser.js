import co from 'co';
import { crud, selectOne } from 'co-postgres-queries';

import { isPasswordValid, hashPassword, generateSalt } from '../services/passwordHash';

const adminUserQueries = crud('admin_user', ['username', 'password', 'salt'], ['id'], ['id', 'username'], [queries => {
    queries.selectOne.returnFields(['id', 'username']);
    queries.selectPage.returnFields(['id', 'username']);
}]);

export default (client) => {
    const queries = adminUserQueries(client);
    const baseInsertOne = queries.insertOne;
    const baseBatchInsert = queries.batchInsert;
    const baseUpdateOne = queries.updateOne;
    const selectOneByUsernameQuery = selectOne('admin_user', ['username'], ['*'])(client);

    queries.insertOne = function* insertOne(user) {
        if (user.password) {
            user.salt = yield generateSalt();
            user.password = yield hashPassword(user.password, user.salt);
        }

        return yield baseInsertOne(user);
    };

    queries.updateOne = function* updateOne(id, user) {
        if (user.password) {
            user.salt = yield generateSalt();
            user.password = yield hashPassword(user.password, user.salt);
        }

        return yield baseUpdateOne(id, user);
    };

    queries.batchInsert = function* batchInsert(users) {
        const preparedUsers = yield users.map(user => co(function* () {
            if (user.password) {
                user.salt = yield generateSalt();
                user.password = yield hashPassword(user.password, user.salt);
            }

            return user;
        }));

        return yield baseBatchInsert(preparedUsers);
    };

    queries.selectOneByUsername = function* selectOneByUsername(username) {
        return yield selectOneByUsernameQuery(username);
    };

    queries.authenticate = function* authenticate(username, password) {
        const foundUser = yield queries.selectOneByUsername(username);
        if (!foundUser || !(yield isPasswordValid(password, foundUser.salt, foundUser.password))) {
            return false;
        }

        return foundUser;
    };

    return queries;
};
