import instituteQueries from '../queries/instituteQueries';
import Community from './Community';
import InstituteCommunity from './InstituteCommunity';
import checkEntityExists from './checkEntityExists';
import entityAssigner from './entityAssigner';

function Institute(client) {
    const instituteClient = client.link(Institute.queries);
    const communityQueries = Community(client);
    const instituteCommunityQueries = InstituteCommunity(client);

    const selectByJanusAccountId = function*(userId) {
        return yield instituteClient.selectByJanusAccountId(
            null,
            null,
            { janus_account_id: userId },
            'index',
            'ASC',
        );
    };

    const selectByInistAccountId = function*(inistAccountId) {
        return yield instituteClient.selectByInistAccountId(
            null,
            null,
            { inist_account_id: inistAccountId },
            'index',
            'ASC',
        );
    };

    const selectByUnitId = function*(unitId) {
        return yield instituteClient.selectByUnitId(
            null,
            null,
            { unit_id: unitId },
            'index',
            'ASC',
        );
    };

    const updateCommunities = entityAssigner(
        communityQueries.selectByIds,
        communityQueries.selectByInstituteId,
        instituteCommunityQueries.unassignCommunityFromInstitute,
        instituteCommunityQueries.assignCommunityToInstitute,
    );

    const insertOne = function* insertOne(institute) {
        try {
            yield client.begin();
            const insertedInstitute = yield instituteClient.insertOne(
                institute,
            );

            const communities = yield updateCommunities(
                institute.communities,
                insertedInstitute.id,
            );

            yield client.commit();

            return {
                ...insertedInstitute,
                communities,
            };
        } catch (error) {
            yield client.rollback();
            throw error;
        }
    };

    const updateOne = function*(selector, institute) {
        try {
            yield client.begin();

            let updatedInstitute;
            try {
                updatedInstitute = yield instituteClient.updateOne(
                    selector,
                    institute,
                );
            } catch (error) {
                if (error.message !== 'no valid column to set') {
                    throw error;
                }
                updatedInstitute = yield instituteClient.selectOne({
                    id: selector,
                });
            }

            const communities = yield updateCommunities(
                institute.communities,
                updatedInstitute.id,
            );

            yield client.commit();

            return {
                ...updatedInstitute,
                communities,
            };
        } catch (error) {
            yield client.rollback();
            throw error;
        }
    };

    const selectByIds = function*(ids) {
        const institutes = yield instituteClient.selectByIds(ids);
        checkEntityExists('Institutes', 'id', ids, institutes);

        return institutes;
    };

    const selectByCodes = function*(codes) {
        const institutes = yield instituteClient.selectBy(null, null, {
            code: codes,
        });
        checkEntityExists('Institutes', 'code', codes, institutes);

        return institutes;
    };

    function* insertInstituteIfNotExists(code, name) {
        if (!code) {
            return null;
        }
        let institute = yield instituteClient.selectOneByCode({ code });
        if (institute) {
            return institute;
        }

        return yield insertOne({ code, name });
    }

    return {
        ...instituteClient,
        selectByJanusAccountId,
        selectByInistAccountId,
        selectByUnitId,
        updateCommunities,
        insertOne,
        updateOne,
        selectByIds,
        selectByCodes,
        insertInstituteIfNotExists,
    };
}

Institute.queries = instituteQueries;

export default Institute;
