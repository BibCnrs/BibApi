import { crud, selectOne, upsertOne } from 'co-postgres-queries';
import co from 'co';
import _ from 'lodash';

import Domain from './Domain';
import UserDomain from './UserDomain';
import { isPasswordValid, hashPassword, generateSalt } from '../services/passwordHash';
import checkDomains from './checkDomains';

const userQueries = crud('bib_user', ['username', 'password', 'salt', 'primary_institute', 'primary_unit'], ['id'], [
    'id',
    'username',
    'primary_institute',
    'primary_unit'
], [
    (queries) => {
        queries.selectOne.returnFields([
            'id',
            'username',
            'primary_institute',
            'primary_unit',
            `ARRAY(SELECT name FROM domain JOIN bib_user_domain ON (domain.id = bib_user_domain.domain_id) WHERE bib_user_domain.bib_user_id = $id) AS domains`
        ]);
        queries.selectPage.returnFields([
            'id',
            'username',
            'primary_institute',
            'primary_unit',
            `ARRAY(SELECT name FROM domain JOIN bib_user_domain ON (domain.id = bib_user_domain.domain_id) WHERE bib_user_domain.bib_user_id = bib_user.id ORDER BY name) AS domains`
        ]);

    }
]);
const upsertOnePerUsernameQuery = upsertOne('bib_user', ['username'], ['primary_institute', 'primary_unit'], ['id', 'username', 'primary_institute', 'primary_unit']);
const selectOneByUsernameQuery = selectOne('bib_user', ['username'], [
    'id',
    'username',
    'password',
    'salt',
    'primary_institute',
    'primary_unit',
    `ARRAY(SELECT name FROM domain JOIN bib_user_domain ON (domain.id = bib_user_domain.domain_id) WHERE bib_user_domain.bib_user_id = bib_user.id ORDER BY name) AS domains`
]);

export default (client) => {
    const domainQueries = Domain(client);
    const queries = userQueries(client);
    const baseUpdateOne = queries.updateOne;
    const baseInsertOne = queries.insertOne;
    const baseBatchInsert = queries.batchInsert;
    const userDomainQueries = UserDomain(client);

    queries.upsertOnePerUsername = upsertOnePerUsernameQuery(client);
    queries.selectOneByUserName = selectOneByUsernameQuery(client);

    queries.updateDomains = function* updateDomains(domainNames = [], user) {
        const nextDomains = domainNames.length ? (yield domainQueries.selectByName(domainNames)) : [];
        checkDomains(domainNames, nextDomains);
        const nextDomainsId = nextDomains.map(domain => domain.id);
        const prevDomains = (yield domainQueries.selectByUser(user));
        const prevDomainsId = prevDomains.map(domain => domain.id);
        const oldDomains = prevDomainsId.filter(prev => nextDomainsId.indexOf(prev) === -1);
        const newDomains = nextDomainsId.filter(next => prevDomainsId.indexOf(next) === -1);
        if (oldDomains.length > 0) {
            yield userDomainQueries.batchDelete(oldDomains.map(domainId => ({ domain_id: domainId, bib_user_id: user.id })));
        }
        if(newDomains.length > 0) {
            yield userDomainQueries.batchInsert(newDomains.map(domainId => ({ domain_id: domainId, bib_user_id: user.id })));
        }

        return nextDomains;
    };

    queries.insertOne = function* insertOne(user) {
        try {
            yield client.begin();
            if (user.password) {
                user.salt = yield generateSalt();
                user.password = yield hashPassword(user.password, user.salt);
            }
            const insertedUser = yield baseInsertOne(user);

            const domains = yield queries.updateDomains(user.domains, insertedUser);

            yield client.commit();

            return {
                ...insertedUser,
                domains: domains
            };
        } catch (error) {
            yield client.rollback();
            throw error;
        }
    };

    queries.updateOne = function* (selector, user) {
        try {
            yield client.begin();
            if (user.password) {
                user.salt = yield generateSalt();
                user.password = yield hashPassword(user.password, user.salt);
            }

            let updatedUser;
            try {
                updatedUser = yield baseUpdateOne(selector, user);
            } catch (error) {
                if(error.message !== 'no valid column to set') {
                    throw error;
                }
                updatedUser = yield queries.selectOne({ id: selector });
            }

            const domains = yield queries.updateDomains(user.domains, updatedUser);

            yield client.commit();

            return {
                ...updatedUser,
                domains
            };
        } catch (error) {
            yield client.rollback();
            throw error;
        }
    };

    queries.batchInsert = function* batchInsert(users) {
        try {
            yield client.begin();
            const preparedUsers = yield users.map(user => co(function* () {
                if (user.password) {
                    user.salt = yield generateSalt();
                    user.password = yield hashPassword(user.password, user.salt);
                }

                return user;
            }));

            const insertedUsers = yield baseBatchInsert(preparedUsers);

            const wantedDomains = _.uniq(_.flatten(users.map(user => user.domains).filter(domains => !!domains)));

            if(wantedDomains.length !== 0) {
                const domains = yield domainQueries.selectByName(wantedDomains);
                checkDomains(wantedDomains, domains);
                const domainsByName = domains.reduce((result, domain) => {
                    return {
                        ...result,
                        [domain.name]: domain
                    };
                }, {});
                const userDomainsToInsert = insertedUsers
                .map((user, index) => ({
                    ...user,
                    domains: users[index].domains
                }))
                .reduce((result, user) => {
                    if (!user.domains || user.domains.length === 0) {
                        return result;
                    }

                    return [
                        ...result,
                        ...user.domains.map(name => ({ domain_id: domainsByName[name].id, bib_user_id: user.id }))
                    ];
                }, []);
                yield userDomainQueries.batchInsert(userDomainsToInsert);
            }

            yield client.commit();

            return insertedUsers;
        } catch (error) {
            yield client.rollback();
            throw error;
        }
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
