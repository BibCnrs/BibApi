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

    queries.insertOne = function* insertOne(institute) {
        try {
            yield client.begin();
            const insertedInstitute = yield baseInsertOne(institute);

            const domains = yield queries.updateDomains(institute.domains, insertedInstitute);

            yield client.commit();

            return {
                ...insertedInstitute,
                domains: domains
            };
        } catch (error) {
            yield client.rollback();
            throw error;
        }
    };

    queries.updateOne = function* (selector, institute) {
        try {
            yield client.begin();

            let updatedInstitute;
            try {
                updatedInstitute = yield baseUpdateOne(selector, institute);
            } catch (error) {
                if(error.message !== 'no valid column to set') {
                    throw error;
                }
                updatedInstitute = yield queries.selectOne({ id: selector });
            }

            const domains = yield queries.updateDomains(institute.domains, updatedInstitute);

            yield client.commit();

            return {
                ...updatedInstitute,
                domains
            };
        } catch(error) {
            yield client.rollback();
            throw error;
        }
    };

    return queries;
};
