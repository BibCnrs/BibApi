import csv from 'csv';
import path from 'path';
import fs from 'fs';
import co from 'co';
import _ from 'lodash';
import minimist from 'minimist';

import { batchUpsertPerCode } from '../../lib/models/Unit';
import { batchUpsert as batchUpsertUniteInstitute } from '../../lib/models/UnitInstitute';
import { batchUpsert as batchUpsertUnitCommunity } from '../../lib/models/UnitCommunity';
import { selectByNames } from '../../lib/models/Community';
import { selectByCodes } from '../../lib/models/Institute';

const arg = minimist(process.argv.slice(2));

const colFieldMap = [
    'code', // Code de l'unité
    'name', // Intitulé
    'body', // Organisme de Rattachement
    'building', // Bâtiment
    'street', // Rue
    'post_office_box', // Boîte Postale
    'postal_code', // Code Postal
    'town', // Ville
    'country', // Pays
    'unit_dr', // DR de l'unité
    'nb_researcher_cnrs', // Nb. chercheurs CNRS
    'nb_researcher_nocnrs', // Nb. chercheurs NON CNRS
    'nb_doctorant', // Nb. DOCTORANTS
    'nb_post_doctorant', // Nb. POST-DOCTORANTS
    'director_name', // Nom du Directeur
    'director_firstname', // Prénom du Directeur
    'director_mail', // Courriel du Directeur
    'correspondant_documentaire', // Correspondant Documentaire
    'cd_phone', // Téléphone CD
    'cd_mail', // Courriel CD
    'correspondant_informatique', // Correspondant Informatique
    'ci_phone', // Téléphone CI
    'ci_mail', // Courriel CI
    'main_institute_inserm', // Inserm (DS de ratt. de l?unité)
    'main_institute_noncnrs', // NONCNRS (DS de ratt. de l?unité)
    'main_institute_conrs', // CONRS (DS de ratt. de l?unité)
    'main_institute_insb', // INSB (DS de ratt. de l?unité)
    'main_institute_ins2i', // INS2I (DS de ratt. de l?unité)
    'main_institute_insis', // INSIS (DS de ratt. de l?unité)
    'main_institute_insmi', // INSMI (DS de ratt. de l?unité)
    'main_institute_inc', // INC (DS de ratt. de l?unité)
    'main_institute_inshs', // INSHS (DS de ratt. de l?unité)
    'main_institute_inee', // INEE (DS de ratt. de l?unité)
    'main_institute_inp', // INP (DS de ratt. de l?unité)
    'main_institute_insu', // INSU (DS de ratt. de l?unité)
    'main_institute_in2p3', // IN2P3 (DS de ratt. de l?unité)
    'main_institute_pdt', // PDT (DS de ratt. de l?unité)
    'main_institute_dgdr', // DGDR (DS de ratt. de l?unité)
    'main_institute_dgds', // DGDS (DS de ratt. de l?unité)
    'secondary_institute_inee', // INEE (DS sec. de l?unité)
    'secondary_institute_inserm', // Inserm (DS sec. de l?unité)
    'secondary_institute_inp', // INP (DS sec. de l?unité)
    'secondary_institute_insb', // INSB (DS sec. de l?unité)
    'secondary_institute_insu', // INSU (DS sec. de l?unité)
    'secondary_institute_inshs', // INSHS (DS sec. de l?unité)
    'secondary_institute_inc', // INC (DS sec. de l?unité)
    'secondary_institute_insis', // INSIS (DS sec. de l?unité)
    'secondary_institute_insmi', // INSMI (DS sec. de l?unité)
    'secondary_institute_ins2i', // INS2I (DS sec. de l?unité)
    'secondary_institute_in2p3', // IN2P3 (DS sec. de l?unité)
    null, // 20 (Sections CN)
    null, // 23 (Sections CN)
    null, // 28 (Sections CN)
    null, // 27 (Sections CN)
    null, // 24 (Sections CN)
    null, // 29 (Sections CN)
    null, // 6 (Sections CN)
    null, // 9 (Sections CN)
    null, // 41 (Sections CN)
    null, // 12 (Sections CN)
    null, // 13 (Sections CN)
    null, // 15 (Sections CN)
    null, // 16 (Sections CN)
    null, // 2 (Sections CN)
    null, // 34 (Sections CN)
    null, // 19 (Sections CN)
    null, // 22 (Sections CN)
    null, // 11 (Sections CN)
    null, // 14 (Sections CN)
    null, // 3 (Sections CN)
    null, // 10 (Sections CN)
    null, // 39 (Sections CN)
    null, // 8 (Sections CN)
    null, // 4 (Sections CN)
    null, // 5 (Sections CN)
    null, // 18 (Sections CN)
    null, // 1 (Sections CN)
    null, // 17 (Sections CN)
    null, // 7 (Sections CN)
    null, // 30 (Sections CN)
    null, // 36 (Sections CN)
    null, // 21 (Sections CN)
    null, // 26 (Sections CN)
    null, // 31 (Sections CN)
    null, // 32 (Sections CN)
    null, // 37 (Sections CN)
    null, // 35 (Sections CN)
    null, // 54 (Sections CN)
    null, // 38 (Sections CN)
    null, // 25 (Sections CN)
    null, // 52 (Sections CN)
    null, // 51 (Sections CN)
    null, // 33 (Sections CN)
    null, // 53 (Sections CN)
    null, // 40 (Sections CN)
    null, // 50 (Sections CN)
    null, // domain_biblioinserm
    null, // domain_bibliovie
    null, // domain_biblioshs
    null, // domain_bibliosciences
    'domain_INSB',
    null, // domain_bibliost2i
    'domain_INS2I',
    'domain_INSIS',
    'domain_INSMI',
    null, // domain_titanesciences
    'domain_INC',
    'domain_INSHS',
    'domain_INEE',
    null, // domain_archivesiop
    'domain_INP',
    null, // domain_biblioplanets
    'domain_INSU',
    'domain_IN2P3',
    'domain_REAXYS',
    'comment',
    null, // nb_unit_account
];

const instituteCodeDictionary = {
    inserm: 'INSERM',
    noncnrs: 'NC',
    conrs: 'CONRS',
    insb: 'DS53',
    ins2i: 'DS61',
    insis: 'DS56',
    insmi: 'DS59',
    inc: 'DS52',
    inp: 'DS51',
    inshs: 'DS54',
    inee: 'DS55',
    insu: 'DS58',
    iNn2p3: 'DS57',
    in2p3: 'DS57',
    pdt: 'DS98',
    dgdr: 'DS96',
    dgds: 'DS99',
};

co(function* () {
    const filename = arg._[0];
    if (!filename) {
        global.console.error('You must specify a file to import');
        process.exit(1);
    }
    const filePath = path.join(__dirname, '/../../', filename);
    const file = fs.createReadStream(filePath, { encoding: 'utf8' });

    var parse = function (rawUnit) {
        if (rawUnit.length !== 117) {
            throw new Error('wrong csv format');
        }

        return rawUnit.reduce(
            (unit, col, index) => {
                const fieldName = colFieldMap[index];
                if (!fieldName) {
                    return unit;
                }
                if (fieldName.match(/main_institute/)) {
                    if (col === 'non') {
                        return unit;
                    }
                    const name =
                        instituteCodeDictionary[fieldName.split('_')[2]];
                    if (!name) {
                        return unit;
                    }
                    return {
                        ...unit,
                        main_institute: name,
                    };
                }
                if (fieldName.match(/secondary_institute/)) {
                    if (col === 'non') {
                        return unit;
                    }
                    const name =
                        instituteCodeDictionary[fieldName.split('_')[2]];
                    if (!name) {
                        return unit;
                    }
                    return {
                        ...unit,
                        institutes: [...unit.institutes, name],
                    };
                }
                if (fieldName.match(/domain/)) {
                    if (col === 'non') {
                        return unit;
                    }
                    const name = fieldName.split('_')[1];
                    if (!name) {
                        return unit;
                    }
                    return {
                        ...unit,
                        communities: [...unit.communities, name],
                    };
                }

                return {
                    ...unit,
                    [colFieldMap[index]]: col === '' ? null : col,
                };
            },
            {
                institutes: [],
                communities: [],
            },
        );
    };

    var load = function (file) {
        return new Promise(function (resolve, reject) {
            file.pipe(csv.parse({ delimiter: ';' })).pipe(
                csv.transform(
                    function (rawUnit) {
                        try {
                            const parsedUnit = parse(rawUnit);
                            if (
                                !parsedUnit ||
                                parsedUnit.nb_researcher_cnrs ===
                                    'Nb. chercheurs CNRS'
                            ) {
                                return;
                            }
                            return parsedUnit;
                        } catch (error) {
                            error.message = `On entry: ${rawUnit} Error: ${error.message}`;
                            throw error;
                        }
                    },
                    function (error, data) {
                        if (error) {
                            reject(error);
                        }
                        resolve(data);
                    },
                ),
            );
        });
    };

    const parsedUnits = (yield load(file)).filter((data) => !!data);

    const institutesCode = _.uniq(
        _.flatten(parsedUnits.map((unit) => unit.institutes)),
    );
    const institutes = yield selectByCodes(institutesCode);
    const institutesPerCode = institutes.reduce(
        (result, institute) => ({
            ...result,
            [institute.code]: institute.id,
        }),
        {},
    );

    const communityNames = _.uniq(
        _.flatten(parsedUnits.map((unit) => unit.communities)),
    );
    const communities = yield selectByNames(communityNames);
    const communitiesPerName = communities.reduce(
        (result, community) => ({
            ...result,
            [community.name]: community.id,
        }),
        {},
    );

    const nbUnits = parsedUnits.length;
    global.console.log(`importing ${nbUnits}`);
    const upsertedUnits = _.flatten(
        yield _.chunk(
            parsedUnits.map((unit) => ({
                ...unit,
                main_institute: institutesPerCode[unit.main_institute],
            })),
            100,
        ).map((unit) => batchUpsertPerCode(unit)),
    ).map((unit, index) => ({
        ...unit,
        institutes: parsedUnits[index].institutes,
        communities: parsedUnits[index].communities,
    }));

    const unitInstitutes = _.flatten(
        upsertedUnits.map((unit) => {
            return unit.institutes.map((code, index) => ({
                unit_id: unit.id,
                institute_id: institutesPerCode[code],
                index,
            }));
        }),
    );
    global.console.log(`assigning ${unitInstitutes.length} institutes to unit`);
    yield _.chunk(unitInstitutes, 100).map((batch) =>
        batchUpsertUniteInstitute(batch),
    );

    const unitCommunities = _.flatten(
        upsertedUnits.map((unit) => {
            return unit.communities.map((name, index) => ({
                unit_id: unit.id,
                community_id: communitiesPerName[name],
                index,
            }));
        }),
    );
    global.console.log(
        `assigning ${unitCommunities.length} communities to unit`,
    );
    yield _.chunk(unitCommunities, 100).map((batch) =>
        batchUpsertUnitCommunity(batch),
    );
    global.console.log('done');
})
    .catch(function (error) {
        global.console.error(error.stack);

        return error;
    })
    .then(function (error) {
        process.exit(error ? 1 : 0);
    });
