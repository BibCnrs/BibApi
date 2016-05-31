import { crud } from 'co-postgres-queries';

import Domain from './Domain';
import InstituteDomain from './InstituteDomain';
import checkDomains from './checkDomains';

const instituteQueries = crud('institute', ['code', 'name'], ['id'], ['*'], [
    (queries) => {
        queries.selectOne.returnFields([
            'id',
            'code',
            'name',
            `ARRAY(SELECT name FROM domain JOIN institute_domain ON (domain.id = institute_domain.domain_id) WHERE institute_domain.institute_id = $id) AS domains`
        ]);
        queries.selectPage.returnFields([
            'id',
            'code',
            'name',
            `ARRAY(SELECT name FROM domain JOIN institute_domain ON (domain.id = institute_domain.domain_id) WHERE institute_domain.institute_id = institute.id ORDER BY name) AS domains`
        ]);
    }
]);

export default (client) => {
    const queries = instituteQueries(client);
    const domainQueries = Domain(client);
    const instituteDomainQueries = InstituteDomain(client);
    const baseInsertOne = queries.insertOne;
    const baseUpdateOne = queries.updateOne;

    queries.updateDomains = function* updateDomains(domainNames = [], institute) {
        const nextDomains = domainNames.length ? (yield domainQueries.selectByName(domainNames)) : [];
        checkDomains(domainNames, nextDomains);
        const nextDomainsId = nextDomains.map(domain => domain.id);
        const prevDomains = (yield domainQueries.selectByInstitute(institute));
        const prevDomainsId = prevDomains.map(domain => domain.id);
        const oldDomains = prevDomainsId.filter(prev => nextDomainsId.indexOf(prev) === -1);
        const newDomains = nextDomainsId.filter(next => prevDomainsId.indexOf(next) === -1);
        if (oldDomains.length > 0) {
            yield instituteDomainQueries.batchDelete(oldDomains.map(domainId => ({ domain_id: domainId, institute_id: institute.id })));
        }
        if(newDomains.length > 0) {
            yield instituteDomainQueries.batchInsert(newDomains.map(domainId => ({ domain_id: domainId, institute_id: institute.id })));
        }

        return nextDomains;
    };

    queries.insertOne = function* insertOne(user) {
        try {
            yield client.begin();
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

            let updatedUser;
            try {
                updatedUser = yield baseUpdateOne(selector, user);
            } catch (e) {
                if(e.message === 'no valid column to set') {
                    updatedUser = yield queries.selectOne({ id: selector });
                }
            }

            const domains = yield queries.updateDomains(user.domains, updatedUser);

            yield client.commit();

            return {
                ...updatedUser,
                domains
            };
        } catch(error) {
            yield client.rollback();
            throw error;
        }
    };

    return queries;
};
