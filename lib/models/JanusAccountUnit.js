import janusAccountUnitQueries from '../queries/janusAccountUnitQueries';

function JanusAccountUnit(client) {
    const janusAccountUnitClient = client.link(JanusAccountUnit.queries);

    const assignUnitToJanusAccount = function* (unitIds, userId) {
        return yield janusAccountUnitClient.batchUpsert(
            unitIds.map((unitId, index) => ({
                unit_id: unitId,
                janus_account_id: userId,
                index,
            })),
        );
    };

    const unassignUnitFromJanusAccount = function* (unitIds, userId) {
        return yield janusAccountUnitClient.batchDelete(
            unitIds.map((unitId) => ({
                unit_id: unitId,
                janus_account_id: userId,
            })),
        );
    };

    return {
        ...janusAccountUnitClient,
        assignUnitToJanusAccount,
        unassignUnitFromJanusAccount,
    };
}

JanusAccountUnit.queries = janusAccountUnitQueries;

export default JanusAccountUnit;
