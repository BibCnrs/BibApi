import unitQueries from '../queries/unitQueries';
import Community from './Community';
import Institute from './Institute';
import UnitCommunity from './UnitCommunity';
import UnitInstitute from './UnitInstitute';
import entityAssigner from './entityAssigner';
import checkEntityExists from './checkEntityExists';

function Unit(client) {
    const unitClient = client.link(Unit.queries);
    const communityQueries = Community(client);
    const instituteQueries = Institute(client);
    const unitCommunityQueries = UnitCommunity(client);
    const unitInstituteQueries = UnitInstitute(client);

    const updateCommunities = entityAssigner(
        communityQueries.selectByIds,
        communityQueries.selectByUnitId,
        unitCommunityQueries.unassignCommunityFromUnit,
        unitCommunityQueries.assignCommunityToUnit
    );

    const updateInstitutes = entityAssigner(
        instituteQueries.selectByIds,
        instituteQueries.selectByUnitId,
        unitInstituteQueries.unassignInstituteFromUnit,
        unitInstituteQueries.assignInstituteToUnit
    );

    const insertOne = function* insertOne(unit) {
        try {
            yield client.begin();

            const insertedUnit = yield unitClient.insertOne(unit);

            const communities = yield updateCommunities(unit.communities, insertedUnit.id);
            const institutes = yield updateInstitutes(unit.institutes, insertedUnit.id);

            yield client.commit();

            return {
                ...insertedUnit,
                communities,
                institutes
            };
        } catch (error) {
            yield client.rollback();
            throw error;
        }
    };

    const updateOne = function* (selector, unit) {
        try {
            yield client.begin();

            let updatedUnit;
            try {
                updatedUnit = yield unitClient.updateOne(selector, unit);
            } catch (error) {
                if(error.message !== 'no valid column to set') {
                    throw error;
                }
                updatedUnit = yield unitClient.selectOne({ id: selector });
            }

            const communities = yield updateCommunities(unit.communities, updatedUnit.id);
            const institutes = yield updateInstitutes(unit.institutes, updatedUnit.id);

            yield client.commit();

            return {
                ...updatedUnit,
                communities,
                institutes
            };
        } catch(error) {
            yield client.rollback();
            throw error;
        }
    };

    const selectByIds = function* (ids) {
        const units = yield unitClient.selectByIds(ids);
        checkEntityExists('Units', 'id', ids, units);

        return units;
    };

    const selectByCodes = function* (codes) {
        const units = yield unitClient.selectBy(null, null, { code: codes });
        checkEntityExists('Units', 'id', codes, units);

        return units;
    };

    const selectByJanusAccountId = function* (userId) {
        return yield unitClient.selectByJanusAccountId(null, null, { janus_account_id: userId }, 'index', 'ASC');
    };

    const selectByInistAccountId = function* (inistAccountId) {
        return yield unitClient.selectByInistAccountId(null, null, { inist_account_id: inistAccountId }, 'index', 'ASC');
    };

    return {
        ...unitClient,
        updateCommunities,
        updateInstitutes,
        insertOne,
        updateOne,
        selectByIds,
        selectByCodes,
        selectByJanusAccountId,
        selectByInistAccountId
    };
}

Unit.queries = unitQueries;

export default Unit;
