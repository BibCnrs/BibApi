import inistAccountUnitQueries from '../queries/inistAccountUnitQueries';

function InistAccountUnit(client) {
    const inistAccountInstituteClient = client.link(InistAccountUnit.queries);

    const assignUnitToInistAccount = function* (unitIds, inistAccountId) {
        return yield inistAccountInstituteClient.batchUpsert(
            unitIds.map((unitId, index) => ({
                unit_id: unitId,
                inist_account_id: inistAccountId,
                index,
            })),
        );
    };

    const unassignUnitFromInistAccount = function* (unitIds, inistAccountId) {
        return yield inistAccountInstituteClient.batchDelete(
            unitIds.map(unitId => ({
                unit_id: unitId,
                inist_account_id: inistAccountId,
            })),
        );
    };

    return {
        ...inistAccountInstituteClient,
        assignUnitToInistAccount,
        unassignUnitFromInistAccount,
    };
}

InistAccountUnit.queries = inistAccountUnitQueries;

export default InistAccountUnit;
