import { crud } from 'co-postgres-queries';

const userInstituteQueries = crud('janus_account_institute', ['institute_id', 'janus_account_id'], ['institute_id', 'janus_account_id', 'index'], ['*'], []);

export default (client) => {
    const queries = userInstituteQueries(client);

    queries.assignInstituteToUser = function* (instituteIds, userId) {
        return yield queries.batchInsert(instituteIds.map((instituteId, index) => ({ institute_id: instituteId, janus_account_id: userId, index })));
    };

    queries.unassignInstituteFromUser = function* (instituteIds, userId) {
        return yield queries.batchDelete(instituteIds.map((instituteId, index) => ({ institute_id: instituteId, janus_account_id: userId, index })));
    };

    return queries;
};
