import { crud } from 'co-postgres-queries';

const userUnitQueries = crud('bib_user_unit', ['unit_id', 'bib_user_id'], ['unit_id', 'bib_user_id'], ['*'], []);

export default (client) => {
    const queries = userUnitQueries(client);

    queries.assignUnitToUser = function* (unitIds, userId) {
        return yield queries.batchInsert(unitIds.map(unitId => ({ unit_id: unitId, bib_user_id: userId })));
    };

    queries.unassignUnitFromUser = function* (unitIds, userId) {
        return yield queries.batchDelete(unitIds.map(unitId => ({ unit_id: unitId, bib_user_id: userId })));
    };

    return queries;
};
