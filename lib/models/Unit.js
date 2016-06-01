import { crud, upsertOne, selectOne } from 'co-postgres-queries';

import Domain from './Domain';
import UnitDomain from './UnitDomain';
import entityAssigner from './entityAssigner';

const unitQueries = crud('unit', ['name', 'comment'], ['id'], ['*'], [
    (queries) => {
        queries.selectOne.returnFields([
            'id',
            'name',
            'comment',
            `ARRAY(SELECT name FROM domain JOIN unit_domain ON (domain.id = unit_domain.domain_id) WHERE unit_domain.unit_id = $id ORDER BY name) AS domains`
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
const selectOneByNameQuery = selectOne('unit', ['name'], ['id', 'name', 'comment']);

export default (client) => {
    const queries = unitQueries(client);
    const domainQueries = Domain(client);
    const unitDomainQueries = UnitDomain(client);
    const baseInsertOne = queries.insertOne;
    const baseUpdateOne = queries.updateOne;

    queries.upsertOnePerName = upsertOnePerNameQuery(client);
    queries.selectOneByName = selectOneByNameQuery(client);

    queries.updateDomains = entityAssigner(
        domainQueries.selectByNames,
        domainQueries.selectByUnitId,
        unitDomainQueries.unassignDomainFromUnit,
        unitDomainQueries.assignDomainToUnit
    );

    queries.insertOne = function* insertOne(unit) {
        try {
            yield client.begin();
            const insertedUnit = yield baseInsertOne(unit);

            const domains = yield queries.updateDomains(unit.domains, insertedUnit.id);

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

            const domains = yield queries.updateDomains(unit.domains, updatedUnit.id);

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
