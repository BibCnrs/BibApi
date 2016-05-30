import { crud, selectOne } from 'co-postgres-queries';
import co from 'co';

import Domain from './Domain';
import UserDomain from './UserDomain';
import { isPasswordValid, hashPassword, generateSalt } from '../services/passwordHash';

const userQueries = crud('bib_user', ['username', 'password', 'salt', 'institute', 'unit'], ['id'], [
    'id',
    'username',
    'institute',
    'unit'
], [
    (queries) => {
        queries.selectOne.returnFields([
            'id',
            'username',
            'institute',
            'unit',
            `ARRAY((SELECT name FROM domain JOIN bib_user_domain ON (domain.id = bib_user_domain.domain_id) WHERE bib_user_domain.bib_user_id = $id)) AS domains`
        ]);
        queries.selectPage.returnFields([
            'id',
            'username',
            'institute',
            'unit',
            `ARRAY(SELECT name FROM domain JOIN bib_user_domain ON (domain.id = bib_user_domain.domain_id) WHERE bib_user_domain.bib_user_id = bib_user.id ORDER BY name) AS domains`
        ]);

    }
]);

function checkDomains(wantedDomains, existingDomains) {
    if (wantedDomains.length !== existingDomains.length) {
        const missindDomains = wantedDomains.filter(domain => existingDomains.map(domain => domain.name).indexOf(domain) === -1);
        throw new Error(`Domains ${missindDomains.join(', ')} does not exists`);
    }
}

export default (client) => {
    const domainQueries = Domain(client);
    const queries = userQueries(client);
    const baseUpdateOne = queries.updateOne;
    const baseInsertOne = queries.insertOne;
    const baseBatchInsert = queries.batchInsert;
    const userDomainQueries = UserDomain(client);
    queries.selectOneByUserName = selectOne('bib_user', ['username'], ['*'])(client);

    queries.insertOne = function* insertOne(user) {
        try {
            yield client.begin();
            if (user.password) {
                user.salt = yield generateSalt();
                user.password = yield hashPassword(user.password, user.salt);
            }
            const insertedUser = yield baseInsertOne(user);


            if (user.domains && user.domains.length > 0) {
                const domains = yield domainQueries.selectByName(user.domains);
                checkDomains(user.domains, domains);
                yield userDomainQueries.batchInsert(domains.map(domain => ({ domain_id: domain.id, bib_user_id: insertedUser.id })));
            }

            yield client.commit();

            return insertedUser;
        } catch (error) {
            yield client.rollback();
            throw error;
        }
    };

    queries.updateOne = function* (selector, user) {
        return yield co(function* () {
            yield client.begin();
            if (user.password) {
                user.salt = yield generateSalt();
                user.password = yield hashPassword(user.password, user.salt);
            }

            let updatedUser;
            try {
                updatedUser = yield baseUpdateOne(selector, user);
            } catch (e) {
                if(e.message === 'no valid column to set') {
                    updatedUser = yield queries.selectOne({ id: selector });
                }
            }
            if (user.domains) {
                const prevDomains = (yield domainQueries.selectByUser(updatedUser));
                const nextDomains = (yield domainQueries.selectByName(user.domains));
                const prevDomainsId = prevDomains.map(domain => domain.id);
                const nextDomainsId = nextDomains.map(domain => domain.id);
                checkDomains(user.domains, nextDomains);
                const oldDomains = prevDomainsId.filter(prev => nextDomainsId.indexOf(prev) === -1);
                const newDomains = nextDomainsId.filter(next => prevDomainsId.indexOf(next) === -1);
                if (oldDomains.length > 0) {
                    yield userDomainQueries.batchDelete(oldDomains.map(domainId => ({ domain_id: domainId, bib_user_id: updatedUser.id })));
                }
                if(newDomains.length > 0) {
                    yield userDomainQueries.batchInsert(newDomains.map(domainId => ({ domain_id: domainId, bib_user_id: updatedUser.id })));
                }
            }

            yield client.commit();

            return updatedUser;
        })
        .catch(e => co(function* () {
            yield client.rollback();
            throw e;
        }));

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
        if (!foundUser || !foundUser.password || !(yield isPasswordValid(password, foundUser.salt, foundUser.password))) {
            return false;
        }

        return foundUser;
    };

    return queries;
};
