import { crud, selectOne } from 'co-postgres-queries';
import co from 'co';

import Domain from './Domain';
import UserDomain from './UserDomain';
import { isPasswordValid, hashPassword, generateSalt } from '../services/passwordHash';

const userQueries = crud('bib_user', ['username', 'password', 'salt', 'institute', 'unit'], ['id'], ['*'], [
    (queries) => {
        queries.selectOne.table('bib_user');
        queries.selectOne.returnFields([
            'username',
            'institute',
            'unit',
            `ARRAY((SELECT name FROM domain JOIN bib_user_domain ON (domain.id = bib_user_domain.domain_id) WHERE bib_user_domain.bib_user_id = $id)) AS domains`
        ]);
        queries.selectPage.table('bib_user');
        queries.selectPage.returnFields([
            'username',
            'institute',
            'unit',
            `ARRAY(SELECT name FROM domain JOIN bib_user_domain ON (domain.id = bib_user_domain.domain_id) WHERE bib_user_domain.bib_user_id = bib_user.id ORDER BY name) AS domains`
        ]);

    }
]);

export default (client) => {
    const domainQueries = Domain(client);
    const queries = userQueries(client);
    const baseUpdateOne = queries.updateOne;
    const baseInsertOne = queries.insertOne;
    const baseBatchInsert = queries.batchInsert;
    const userDomainQueries = UserDomain(client);
    queries.selectOneByUserName = selectOne('bib_user', ['username'], ['*'])(client);

    queries.insertOne = function* insertOne(user) {
        yield client.begin();
        if (user.password) {
            user.salt = yield generateSalt();
            user.password = yield hashPassword(user.password, user.salt);
        }
        const insertedUser = yield baseInsertOne(user);


        if (user.domains && user.domains.length > 0) {
            const domains = yield domainQueries.selectByName(user.domains);
            yield userDomainQueries.batchInsert(domains.map(domain => ({ domain_id: domain.id, bib_user_id: insertedUser.id })));
        }

        yield client.commit();

        return insertedUser;
    };

    queries.updateOne = function* (selector, user) {
        return yield co(function* () {
            yield client.begin();
            if (user.password) {
                user.salt = yield generateSalt();
                user.password = yield hashPassword(user.password, user.salt);
            }
            const updatedUser = yield baseUpdateOne(selector, user);
            if (user.domains) {
                const prevDomains = yield domainQueries.selectByUser(updatedUser);
                const nextDomains = yield domainQueries.selectByName(user.domains);
                const oldDomains = prevDomains.filter(prev => nextDomains.indexOf(prev) === -1);
                const newDomains = nextDomains.filter(next => prevDomains.indexOf(next) === -1);
                yield userDomainQueries.batchDelete(oldDomains.map(domain => domain.id));
                yield userDomainQueries.batchInsert(newDomains.map(domain => ({ domain_id: domain.id, bib_user_id: user.id })));
            }

            yield client.commit();


            return updatedUser;
        })
        .catch(e => {
            client.rollback().then(() => {throw e;});
        });

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

    queries.authenticate = function* authenticate(username, password) {
        const foundUser = yield queries.selectOneByUserName(username);
        if (!foundUser || !(yield isPasswordValid(password, foundUser.salt, foundUser.password))) {
            return false;
        }

        return foundUser;
    };

    return queries;
};
