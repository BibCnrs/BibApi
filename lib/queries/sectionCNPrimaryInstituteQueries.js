import { crudQueries, batchUpsertQuery } from 'co-postgres-queries';

const sectionCNPrimaryInstituteQueries = crudQueries(
    'section_cn_primary_institute',
    ['section_cn_id', 'institute_id'],
    ['section_cn_id', 'institute_id'],
    ['*'],
    []
);
const batchUpsert = batchUpsertQuery(
    'section_cn_primary_institute',
    ['section_cn_id', 'institute_id'],
    ['section_cn_id', 'institute_id'],
    ['section_cn_id', 'institute_id']
);

export default {
    ...sectionCNPrimaryInstituteQueries,
    batchUpsert
};
