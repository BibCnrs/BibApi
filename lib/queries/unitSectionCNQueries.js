import { crudQueries, batchUpsertQuery } from 'co-postgres-queries';

const unitSectionCNQueries = crudQueries(
    'unit_section_cn',
    ['unit_id', 'section_cn_id'],
    ['unit_id', 'section_cn_id'],
    ['*'],
    []
);
const batchUpsert = batchUpsertQuery(
    'unit_section_cn',
    ['unit_id', 'section_cn_id'],
    ['unit_id', 'section_cn_id'],
    ['unit_id', 'section_cn_id']
);

export default {
    ...unitSectionCNQueries,
    batchUpsert
};
