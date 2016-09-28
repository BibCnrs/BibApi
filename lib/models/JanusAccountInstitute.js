import { crudQueries, batchUpsertQuery } from 'co-postgres-queries';

const userInstituteQueries = crudQueries('janus_account_institute', ['institute_id', 'janus_account_id', 'index'], ['institute_id', 'janus_account_id'], ['*'], []);
const batchUpsertUserInstituteQuery = batchUpsertQuery('janus_account_institute', ['institute_id', 'janus_account_id'], ['institute_id', 'janus_account_id', 'index'], ['institute_id', 'janus_account_id', 'index']);


export default (client) => {
    const queries = client.link(userInstituteQueries);
    const batchUpsert = client.link(batchUpsertUserInstituteQuery);

    queries.assignInstituteToUser = function* (instituteIds, userId) {
        return yield batchUpsert(instituteIds.map((instituteId, index) => ({ institute_id: instituteId, janus_account_id: userId, index })));
    };

    queries.unassignInstituteFromUser = function* (instituteIds, userId) {
        return yield queries.batchDelete(instituteIds.map(instituteId => ({ institute_id: instituteId, janus_account_id: userId })));
    };

    return queries;
};
