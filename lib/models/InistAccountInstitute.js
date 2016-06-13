import { crud, batchUpsert } from 'co-postgres-queries';

const inistAccountInstituteQueries = crud('inist_account_institute', ['inist_account_id', 'institute_id', 'index'], ['inist_account_id', 'institute_id'], ['*'], []);
const batchUpsertQuery = batchUpsert('inist_account_institute', ['inist_account_id', 'institute_id'], ['inist_account_id', 'institute_id', 'index'], ['inist_account_id', 'institute_id', 'index']);

export default (client) => {
    const queries = inistAccountInstituteQueries(client);

    const batchUpsert = batchUpsertQuery(client);
    queries.batchUpsert = batchUpsert;

    queries.assignInstituteToInistAccount = function* (instituteIds, inistAccountId) {
        return yield batchUpsert(instituteIds.map((instituteId, index) => ({ institute_id: instituteId, inist_account_id: inistAccountId, index })));
    };

    queries.unassignInstituteFromInistAccount = function* (instituteIds, inistAccountId) {
        return yield queries.batchDelete(instituteIds.map(instituteId => ({ institute_id: instituteId, inist_account_id: inistAccountId })));
    };

    return queries;
};
