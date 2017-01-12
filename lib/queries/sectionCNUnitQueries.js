import { crudQueries, batchUpsertQuery } from 'co-postgres-queries';

const sectionCNUnitQueries = crudQueries(
    'section_cn_unit',
    ['section_cn_id', 'unit_id'],
    ['section_cn_id', 'unit_id'],
    ['*'],
    []
);
const batchUpsert = batchUpsertQuery(
    'section_cn_unit',
    ['section_cn_id', 'unit_id'],
    ['section_cn_id', 'unit_id'],
    ['section_cn_id', 'unit_id']
);

export default {
    ...sectionCNUnitQueries,
    batchUpsert
};
