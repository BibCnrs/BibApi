import { crud } from 'co-postgres-queries';

const inistAccountInstituteQueries = crud('inist_account_institute', ['inist_account_id', 'institute_id'], ['inist_account_id', 'institute_id'], ['*'], []);

export default (client) => {
    const queries = inistAccountInstituteQueries(client);

    queries.assignInstituteToInistAccount = function* (instituteIds, inistAccountId) {
        return yield queries.batchInsert(instituteIds.map(instituteId => ({ institute_id: instituteId, inist_account_id: inistAccountId })));
    };

    queries.unassignInstituteFromInistAccount = function* (instituteIds, inistAccountId) {
        return yield queries.batchDelete(instituteIds.map(instituteId => ({ institute_id: instituteId, inist_account_id: inistAccountId })));
    };

    return queries;
};
