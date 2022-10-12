import inistAccountInstituteQueries from '../queries/inistAccountInstituteQueries';

function InistAccountInstitute(client) {
    const inistAccountInstituteClient = client.link(
        InistAccountInstitute.queries,
    );

    const assignInstituteToInistAccount = function* (
        instituteIds,
        inistAccountId,
    ) {
        return yield inistAccountInstituteClient.batchUpsert(
            instituteIds.map((instituteId, index) => ({
                institute_id: instituteId,
                inist_account_id: inistAccountId,
                index,
            })),
        );
    };

    const unassignInstituteFromInistAccount = function* (
        instituteIds,
        inistAccountId,
    ) {
        return yield inistAccountInstituteClient.batchDelete(
            instituteIds.map((instituteId) => ({
                institute_id: instituteId,
                inist_account_id: inistAccountId,
            })),
        );
    };

    return {
        ...inistAccountInstituteClient,
        assignInstituteToInistAccount,
        unassignInstituteFromInistAccount,
    };
}

InistAccountInstitute.queries = inistAccountInstituteQueries;

export default InistAccountInstitute;
