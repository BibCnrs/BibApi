import { crud, selectOne, upsertOne } from 'co-postgres-queries';
import co from 'co';
import _ from 'lodash';

import Domain from './Domain';
import Institute from './Institute';
import Unit from './Unit';
import UserDomain from './UserDomain';
import UserInstitute from './UserInstitute';
import UserUnit from './UserUnit';
import { isPasswordValid, hashPassword, generateSalt } from '../services/passwordHash';
import entityAssigner from './entityAssigner';

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
            (
`ARRAY(
SELECT id
FROM institute
JOIN bib_user_institute ON (institute.id = bib_user_institute.institute_id)
WHERE bib_user_institute.bib_user_id = $id ORDER BY name
) AS additional_institutes`
            ),
            'primary_unit',
            (
`ARRAY(
SELECT id
FROM unit
JOIN bib_user_unit ON (unit.id = bib_user_unit.unit_id)
WHERE bib_user_unit.bib_user_id = $id ORDER BY name
) AS additional_units`
            ),
            (
`ARRAY(
SELECT name
FROM domain
JOIN bib_user_domain ON (domain.id = bib_user_domain.domain_id)
WHERE bib_user_domain.bib_user_id = $id ORDER BY name
) AS domains`),
            (
`ARRAY(
SELECT domain.name
FROM domain
JOIN institute_domain ON (domain.id = institute_domain.domain_id)
JOIN institute ON (institute_domain.institute_id = institute.id)
WHERE institute.id = bib_user.primary_institute
) as primary_institute_domains`
            ), (
`ARRAY(
SELECT domain.name
FROM domain
JOIN institute_domain ON (domain.id = institute_domain.domain_id)
JOIN institute ON (institute_domain.institute_id = institute.id)
JOIN bib_user_institute ON (institute.id = bib_user_institute.institute_id)
WHERE bib_user_institute.bib_user_id = $id
) as additional_institutes_domains`
            ), (
`ARRAY(
SELECT domain.name
FROM domain
JOIN unit_domain ON (domain.id = unit_domain.domain_id)
JOIN unit ON (unit_domain.unit_id = unit.id)
WHERE unit.id = bib_user.primary_unit
) as primary_unit_domains`
            ), (
`ARRAY(
SELECT domain.name
FROM domain
JOIN unit_domain ON (domain.id = unit_domain.domain_id)
JOIN unit ON (unit_domain.unit_id = unit.id)
JOIN bib_user_unit ON (unit.id = bib_user_unit.unit_id)
WHERE bib_user_unit.bib_user_id = $id
) as additional_units_domains`
            )
        ]);
        queries.selectPage.returnFields([
            'id',
            'username',
            'primary_institute',
            'ARRAY(SELECT id FROM institute JOIN bib_user_institute ON (institute.id = bib_user_institute.institute_id) WHERE bib_user_institute.bib_user_id = bib_user.id ORDER BY name) AS additional_institutes',
            'primary_unit',
            'ARRAY(SELECT id FROM unit JOIN bib_user_unit ON (unit.id = bib_user_unit.unit_id) WHERE bib_user_unit.bib_user_id = bib_user.id ORDER BY name) AS additional_units',
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
    const instituteQueries = Institute(client);
    const unitQueries = Unit(client);
    const userInstituteQueries = UserInstitute(client);
    const userUnitQueries = UserUnit(client);
    const queries = userQueries(client);

    const baseUpdateOne = queries.updateOne;
    const baseInsertOne = queries.insertOne;
    const baseBatchInsert = queries.batchInsert;
    const userDomainQueries = UserDomain(client);

    queries.upsertOnePerUsername = upsertOnePerUsernameQuery(client);
    queries.selectOneByUsername = selectOneByUsernameQuery(client);

    queries.updateDomains = entityAssigner(
        domainQueries.selectByNames,
        domainQueries.selectByUserId,
        userDomainQueries.unassignDomainFromUser,
        userDomainQueries.assignDomainToUser
    );

    queries.updateAdditionalInstitutes = entityAssigner(
        instituteQueries.selectByIds,
        instituteQueries.selectByUserId,
        userInstituteQueries.unassignInstituteFromUser,
        userInstituteQueries.assignInstituteToUser
    );

    queries.updateAdditionalUnits = entityAssigner(
        unitQueries.selectByIds,
        unitQueries.selectByUserId,
        userUnitQueries.unassignUnitFromUser,
        userUnitQueries.assignUnitToUser
    );

    queries.insertOne = function* insertOne(user) {
        try {
            yield client.begin();
            if (user.password) {
                user.salt = yield generateSalt();
                user.password = yield hashPassword(user.password, user.salt);
            }
            const insertedUser = yield baseInsertOne(user);

            const domains = yield queries.updateDomains(user.domains, insertedUser.id);
            const additional_institutes = yield queries.updateAdditionalInstitutes(user.additional_institutes, insertedUser.id);
            const additional_units = yield queries.updateAdditionalUnits(user.additional_units, insertedUser.id);

            yield client.commit();

            return {
                ...insertedUser,
                domains,
                additional_institutes,
                additional_units
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
            const domains = yield queries.updateDomains(user.domains, updatedUser.id);
            const additional_institutes = yield queries.updateAdditionalInstitutes(user.additional_institutes, updatedUser.id);
            const additional_units = yield queries.updateAdditionalUnits(user.additional_units, updatedUser.id);

            yield client.commit();

            return {
                ...updatedUser,
                domains,
                additional_institutes,
                additional_units
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
                const domains = yield domainQueries.selectByNames(wantedDomains);
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
        const foundUser = yield queries.selectOneByUsername(username);
        if (!foundUser || !foundUser.password || !(yield isPasswordValid(password, foundUser.salt, foundUser.password))) {
            return false;
        }

        return foundUser;
    };

    return queries;
};
