import { crud } from 'co-postgres-queries';

const userInstituteQueries = crud('bib_user_institute', ['institute_id', 'bib_user_id'], ['institute_id', 'bib_user_id'], ['*'], []);

export default (client) => {
    const queries = userInstituteQueries(client);

    queries.assignInstituteToUser = function* (instituteIds, userId) {
        return yield queries.batchInsert(instituteIds.map(instituteId => ({ institute_id: instituteId, bib_user_id: userId })));
    };

    queries.unassignInstituteFromUser = function* (instituteIds, userId) {
        return yield queries.batchDelete(instituteIds.map(instituteId => ({ institute_id: instituteId, bib_user_id: userId })));
    };

    return queries;
};
