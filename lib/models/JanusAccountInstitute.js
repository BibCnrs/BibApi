import janusAccountInstituteQueries from '../queries/janusAccountInstituteQueries';

function JanusAccountInstitute(client) {
    const janusAccountInstituteClient = client.link(
        JanusAccountInstitute.queries,
    );

    const assignInstituteToJanusAccount = function*(instituteIds, userId) {
        return yield janusAccountInstituteClient.batchUpsert(
            instituteIds.map((instituteId, index) => ({
                institute_id: instituteId,
                janus_account_id: userId,
                index,
            })),
        );
    };

    const unassignInstituteFromJanusAccount = function*(instituteIds, userId) {
        return yield janusAccountInstituteClient.batchDelete(
            instituteIds.map(instituteId => ({
                institute_id: instituteId,
                janus_account_id: userId,
            })),
        );
    };

    return {
        ...janusAccountInstituteClient,
        assignInstituteToJanusAccount,
        unassignInstituteFromJanusAccount,
    };
}

JanusAccountInstitute.queries = janusAccountInstituteQueries;

export default JanusAccountInstitute;
