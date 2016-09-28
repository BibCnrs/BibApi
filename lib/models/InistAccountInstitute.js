import { crudQueries, batchUpsertQuery } from 'co-postgres-queries';

const inistAccountInstituteQueries = crudQueries('inist_account_institute', ['inist_account_id', 'institute_id', 'index'], ['inist_account_id', 'institute_id'], ['*'], []);
const batchUpsertinistAccountInstituteQuery = batchUpsertQuery('inist_account_institute', ['inist_account_id', 'institute_id'], ['inist_account_id', 'institute_id', 'index'], ['inist_account_id', 'institute_id', 'index']);

export default (client) => {
    const queries = client.link(inistAccountInstituteQueries);

    const batchUpsert = client.link(batchUpsertinistAccountInstituteQuery);
    queries.batchUpsert = batchUpsert;

    queries.assignInstituteToInistAccount = function* (instituteIds, inistAccountId) {
        return yield batchUpsert(instituteIds.map((instituteId, index) => ({ institute_id: instituteId, inist_account_id: inistAccountId, index })));
    };

    queries.unassignInstituteFromInistAccount = function* (instituteIds, inistAccountId) {
        return yield queries.batchDelete(instituteIds.map(instituteId => ({ institute_id: instituteId, inist_account_id: inistAccountId })));
    };

    return queries;
};
