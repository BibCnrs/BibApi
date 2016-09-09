import _ from 'lodash';
import { crud, upsertOne, batchUpsert, selectOne, selectPage, selectByOrderedFieldValues } from 'co-postgres-queries';

import Community from './Community';
import Institute from './Institute';
import UnitCommunity from './UnitCommunity';
import UnitInstitute from './UnitInstitute';
import entityAssigner from './entityAssigner';
import checkEntityExists from './checkEntityExists';

const selectCommunities = (
`SELECT name
FROM community
LEFT JOIN unit_community ON (community.id = unit_community.community_id)
WHERE unit_community.unit_id = unit.id
ORDER BY index ASC`
);

const selectInstitutes = (
`SELECT id
FROM institute
LEFT JOIN unit_institute ON (institute.id = unit_institute.institute_id)
WHERE unit_institute.unit_id = unit.id
ORDER BY index ASC`
);

const fields = [
    'id',
    'code',
    'name',
    'body',
    'building',
    'street',
    'post_office_box',
    'postal_code',
    'town',
    'country',
    'unit_dr',
    'nb_researcher_cnrs',
    'nb_researcher_nocnrs',
    'nb_doctorant',
    'nb_post_doctorant',
    'director_name',
    'director_firstname',
    'director_mail',
    'correspondant_documentaire',
    'cd_phone',
    'cd_mail',
    'correspondant_informatique',
    'ci_phone',
    'ci_mail',
    'comment',
    'nb_unit_account'
];

const unitQueries = crud('unit', fields, ['id'], fields, [
    (queries) => {
        queries.selectOne.returnFields(fields.concat([
            `ARRAY(${selectCommunities}) AS communities`,
            `ARRAY(${selectInstitutes}) AS institutes`
        ]));

        queries.selectPage
        .table(
`unit
LEFT JOIN unit_institute ON unit_institute.unit_id = unit.id
LEFT JOIN institute ON institute.id = unit_institute.institute_id
LEFT JOIN unit_community ON unit_community.unit_id = unit.id
LEFT JOIN institute_community ON institute_community.institute_id = institute.id
LEFT JOIN community ON (community.id = unit_community.community_id) OR community.id = institute_community.community_id
`
        )
        .groupByFields(fields.map(field => `unit.${field}`))
        .returnFields(fields
            .map(field => `unit.${field}`)
            .concat([
                `ARRAY(${selectCommunities}) AS communities`,
                `ARRAY(${selectInstitutes}) AS institutes`
            ])
        )
        .searchableFields(
            fields
            .map(field => `unit.${field}`)
            .concat([
                'community.name',
                'institute.id'
            ])
        );
    }
]);
const upsertOnePerCodeQuery = upsertOne('unit', ['code'], [
    'code',
    'name',
    'body',
    'building',
    'street',
    'post_office_box',
    'postal_code',
    'town',
    'country',
    'unit_dr',
    'nb_researcher_cnrs',
    'nb_researcher_nocnrs',
    'nb_doctorant',
    'nb_post_doctorant',
    'director_name',
    'director_firstname',
    'director_mail',
    'correspondant_documentaire',
    'cd_phone',
    'cd_mail',
    'correspondant_informatique',
    'ci_phone',
    'ci_mail',
    'nb_unit_account',
    'comment'
]);

const batchUpsertPerCodeQuery = batchUpsert('unit', ['code'], [
    'code',
    'name',
    'body',
    'building',
    'street',
    'post_office_box',
    'postal_code',
    'town',
    'country',
    'unit_dr',
    'nb_researcher_cnrs',
    'nb_researcher_nocnrs',
    'nb_doctorant',
    'nb_post_doctorant',
    'director_name',
    'director_firstname',
    'director_mail',
    'correspondant_documentaire',
    'cd_phone',
    'cd_mail',
    'correspondant_informatique',
    'ci_phone',
    'ci_mail',
    'nb_unit_account',
    'comment'
]);

const selectOneByCodeQuery = selectOne('unit', ['code'], fields.concat(`ARRAY(${selectCommunities}) AS communities`));

const selectByJanusAccountIdQuery = selectPage(
    'unit JOIN janus_account_unit ON (unit.id = janus_account_unit.unit_id)',
    ['janus_account_id'],
    ['id', 'janus_account_id', 'code', 'index']
);

const selectByInistAccountIdQuery = selectPage(
    'unit JOIN inist_account_unit ON (unit.id = inist_account_unit.unit_id)',
    ['inist_account_id'],
    ['id', 'inist_account_id', 'code', 'index']
);

const selectByQuery = selectPage('unit', ['code'], ['id', 'code']);
const selectByIdsQuery = selectByOrderedFieldValues('unit', ['id'], ['id', 'code', 'name']);

export default (client) => {
    const queries = unitQueries(client);
    const communityQueries = Community(client);
    const instituteQueries = Institute(client);
    const unitCommunityQueries = UnitCommunity(client);
    const unitInstituteQueries = UnitInstitute(client);
    const baseInsertOne = queries.insertOne;
    const baseUpdateOne = queries.updateOne;

    const selectByJanusAccountId = selectByJanusAccountIdQuery(client);
    const selectByInistAccountId = selectByInistAccountIdQuery(client);
    const selectBy = selectByQuery(client);
    const selectByIds = selectByIdsQuery(client);

    queries.upsertOnePerCode = upsertOnePerCodeQuery(client);
    queries.batchUpsertPerCode = batchUpsertPerCodeQuery(client);
    queries.selectOneByCode = selectOneByCodeQuery(client);

    queries.updateCommunities = entityAssigner(
        communityQueries.selectByNames,
        communityQueries.selectByUnitId,
        unitCommunityQueries.unassignCommunityFromUnit,
        unitCommunityQueries.assignCommunityToUnit
    );

    queries.updateInstitutes = entityAssigner(
        instituteQueries.selectByIds,
        instituteQueries.selectByUnitId,
        unitInstituteQueries.unassignInstituteFromUnit,
        unitInstituteQueries.assignInstituteToUnit
    );

    queries.insertOne = function* insertOne(unit) {
        try {
            yield client.begin();

            const insertedUnit = yield baseInsertOne(unit);

            const communities = yield queries.updateCommunities(unit.communities, insertedUnit.id);
            const institutes = yield queries.updateInstitutes(unit.institutes, insertedUnit.id);

            yield client.commit();

            return {
                ...insertedUnit,
                communities,
                institutes
            };
        } catch (error) {
            yield client.rollback();
            throw error;
        }
    };

    queries.updateOne = function* (selector, unit) {
        try {
            yield client.begin();

            let updatedUnit;
            try {
                updatedUnit = yield baseUpdateOne(selector, unit);
            } catch (error) {
                if(error.message !== 'no valid column to set') {
                    throw error;
                }
                updatedUnit = yield queries.selectOne({ id: selector });
            }

            const communities = yield queries.updateCommunities(unit.communities, updatedUnit.id);
            const institutes = yield queries.updateInstitutes(unit.institutes, updatedUnit.id);

            yield client.commit();

            return {
                ...updatedUnit,
                communities,
                institutes
            };
        } catch(error) {
            yield client.rollback();
            throw error;
        }
    };

    queries.selectByIds = function* (ids) {
        const units = yield selectByIds(ids);
        checkEntityExists('Units', 'id', ids, units);

        return units;
    };

    queries.selectByCodes = function* (codes) {
        const units = yield selectBy(null, null, { code: codes });
        checkEntityExists('Units', 'id', codes, units);

        return units;
    };

    queries.selectByJanusAccountId = function* (userId) {
        return yield selectByJanusAccountId(null, null, { janus_account_id: userId }, 'index', 'ASC');
    };

    queries.selectByInistAccountId = function* (inistAccountId) {
        return yield selectByInistAccountId(null, null, { inist_account_id: inistAccountId }, 'index', 'ASC');
    };

    return queries;
};
