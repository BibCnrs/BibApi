import { crud, upsertOne, selectOne } from 'co-postgres-queries';

import Domain from './Domain';
import UnitDomain from './UnitDomain';
import checkDomains from './checkDomains';

const unitQueries = crud('unit', ['name', 'comment'], ['id'], ['*'], [
    (queries) => {
        queries.selectOne.returnFields([
            'id',
            'name',
            'comment',
            `ARRAY(SELECT name FROM domain JOIN unit_domain ON (domain.id = unit_domain.domain_id) WHERE unit_domain.unit_id = $id) AS domains`
        ]);
        queries.selectPage.returnFields([
            'id',
            'name',
            'comment',
            `ARRAY(SELECT name FROM domain JOIN unit_domain ON (domain.id = unit_domain.domain_id) WHERE unit_domain.unit_id = unit.id ORDER BY name) AS domains`
        ]);
    }
]);
const upsertOnePerNameQuery = upsertOne('unit', ['name'], ['comment']);
const selectOneByNameQuery = selectOne('unit', ['name']);

export default (client) => {
    const queries = unitQueries(client);
    const domainQueries = Domain(client);
    const unitDomainQueries = UnitDomain(client);
    const baseInsertOne = queries.insertOne;
    const baseUpdateOne = queries.updateOne;

    queries.upsertOnePerName = upsertOnePerNameQuery(client);
    queries.selectOneByName = selectOneByNameQuery(client);

    queries.updateDomains = function* updateDomains(domainNames = [], unit) {
        const nextDomains = domainNames.length ? (yield domainQueries.selectByName(domainNames)) : [];
        checkDomains(domainNames, nextDomains);
        const nextDomainsId = nextDomains.map(domain => domain.id);
        const prevDomains = (yield domainQueries.selectByUnit(unit));
        const prevDomainsId = prevDomains.map(domain => domain.id);
        const oldDomains = prevDomainsId.filter(prev => nextDomainsId.indexOf(prev) === -1);
        const newDomains = nextDomainsId.filter(next => prevDomainsId.indexOf(next) === -1);
        if (oldDomains.length > 0) {
            yield unitDomainQueries.batchDelete(oldDomains.map(domainId => ({ domain_id: domainId, unit_id: unit.id })));
        }
        if(newDomains.length > 0) {
            yield unitDomainQueries.batchInsert(newDomains.map(domainId => ({ domain_id: domainId, unit_id: unit.id })));
        }

        return nextDomains;
    };

    queries.insertOne = function* insertOne(unit) {
        try {
            yield client.begin();
            const insertedUnit = yield baseInsertOne(unit);

            const domains = yield queries.updateDomains(unit.domains, insertedUnit);

            yield client.commit();

            return {
                ...insertedUnit,
                domains: domains
            };
        } catch (error) {
            yield client.rollback();
            throw error;
        }
    };

    queries.updateOne = function* (selector, unit) {
        try {
            yield client.begin();

            let updatedUnit;
            try {
                updatedUnit = yield baseUpdateOne(selector, unit);
            } catch (error) {
                if(error.message !== 'no valid column to set') {
                    throw error;
                }
                updatedUnit = yield queries.selectOne({ id: selector });
            }

            const domains = yield queries.updateDomains(unit.domains, updatedUnit);

            yield client.commit();

            return {
                ...updatedUnit,
                domains
            };
        } catch(error) {
            yield client.rollback();
            throw error;
        }
    };

    return queries;
};
