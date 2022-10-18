import _ from 'lodash';
import csv from 'csv';
import path from 'path';
import fs from 'fs';
import co from 'co';
import minimist from 'minimist';

import { selectByCodes as selectUnitByCodes } from '../../lib/models/Unit';
import { selectByCodes as selectSectionByCodes } from '../../lib/models/SectionCN';
import { batchUpsert } from '../../lib/models/UnitSectionCN';

const arg = minimist(process.argv.slice(2));

const colFieldMap = [
    'code', // Code de l'unité
    null, // Intitulé
    null, // Organisme de Rattachement
    null, // Bâtiment
    null, // Rue
    null, // Boîte Postale
    null, // Code Postal
    null, // Ville
    null, // Pays
    null, // DR de l'unité
    null, // Nb. chercheurs CNRS
    null, // Nb. chercheurs NON CNRS
    null, // Nb. DOCTORANTS
    null, // Nb. POST-DOCTORANTS
    null, // Nom du Directeur
    null, // Prénom du Directeur
    null, // Courriel du Directeur
    null, // Correspondant Documentaire
    null, // Téléphone CD
    null, // Courriel CD
    null, // Correspondant Informatique
    null, // Téléphone CI
    null, // Courriel CI
    null, // Inserm (DS de ratt. de l?unité)
    null, // NONCNRS (DS de ratt. de l?unité)
    null, // CONRS (DS de ratt. de l?unité)
    null, // INSB (DS de ratt. de l?unité)
    null, // INS2I (DS de ratt. de l?unité)
    null, // INSIS (DS de ratt. de l?unité)
    null, // INSMI (DS de ratt. de l?unité)
    null, // INC (DS de ratt. de l?unité)
    null, // INSHS (DS de ratt. de l?unité)
    null, // INEE (DS de ratt. de l?unité)
    null, // INP (DS de ratt. de l?unité)
    null, // INSU (DS de ratt. de l?unité)
    null, // IN2P3 (DS de ratt. de l?unité)
    null, // PDT (DS de ratt. de l?unité)
    null, // DGDR (DS de ratt. de l?unité)
    null, // DGDS (DS de ratt. de l?unité)
    null, // INEE (DS sec. de l?unité)
    null, // Inserm (DS sec. de l?unité)
    null, // INP (DS sec. de l?unité)
    null, // INSB (DS sec. de l?unité)
    null, // INSU (DS sec. de l?unité)
    null, // INSHS (DS sec. de l?unité)
    null, // INC (DS sec. de l?unité)
    null, // INSIS (DS sec. de l?unité)
    null, // INSMI (DS sec. de l?unité)
    null, // INS2I (DS sec. de l?unité)
    null, // IN2P3 (DS sec. de l?unité)
    'section_20',
    'section_23',
    'section_28',
    'section_27',
    'section_24',
    'section_29',
    'section_6',
    'section_9',
    'section_41',
    'section_12',
    'section_13',
    'section_15',
    'section_16',
    'section_2',
    'section_34',
    'section_19',
    'section_22',
    'section_11',
    'section_14',
    'section_3',
    'section_10',
    'section_39',
    'section_8',
    'section_4',
    'section_5',
    'section_18',
    'section_1',
    'section_17',
    'section_7',
    'section_30',
    'section_36',
    'section_21',
    'section_26',
    'section_31',
    'section_32',
    'section_37',
    'section_35',
    'section_54',
    'section_38',
    'section_25',
    'section_52',
    'section_51',
    'section_33',
    'section_53',
    'section_40',
    'section_50',
    null, // domain_biblioinserm
    null, // domain_bibliovie
    null, // domain_biblioshs
    null, // domain_bibliosciences
    null, // domain_INSB
    null, // domain_bibliost2i
    null, // domain_INS2I
    null, // domain_INSIS
    null, // domain_INSMI
    null, // domain_titanesciences
    null, // domain_INC
    null, // domain_INSHS
    null, // domain_INEE
    null, // domain_archivesiop
    null, // 'domain_INP
    null, // domain_biblioplanets
    null, // domain_INSU
    null, // domain_IN2P3
    null, // domain_REAXYS
    null, // comment
    null, // nb_unit_accoun
];

co(function* importSectionCN() {
    const filename = arg._[0];
    if (!filename) {
        global.console.error('You must specify a file to import');
        process.exit(1);
    }
    const filePath = path.join(__dirname, '/../../', filename);
    const file = fs.createReadStream(filePath, { encoding: 'utf8' });

    var parse = function (rawSectionCN) {
        if (rawSectionCN.length !== 117) {
            throw new Error('wrong csv format');
        }

        return rawSectionCN.reduce(
            (unit, col, index) => {
                const fieldName = colFieldMap[index];
                if (!fieldName) {
                    return unit;
                }
                if (fieldName.match(/section/)) {
                    if (col === 'non') {
                        return unit;
                    }
                    return {
                        ...unit,
                        sections_cn: [
                            ...unit.sections_cn,
                            fieldName.split('_')[1],
                        ],
                    };
                }

                return {
                    ...unit,
                    [colFieldMap[index]]: col === '' ? null : col,
                };
            },
            { sections_cn: [] },
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
                                parsedUnit.code === "Code de l'unité"
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

    const sectionsCode = _.uniq(
        _.flatten(parsedUnits.map((unit) => unit.sections_cn)),
    );
    const sections = yield selectSectionByCodes(sectionsCode);
    const sectionsPerCode = sections.reduce(
        (result, section) => ({
            ...result,
            [section.code]: section.id,
        }),
        {},
    );

    const unitsCode = parsedUnits.map((unit) => unit.code);
    const units = yield selectUnitByCodes(unitsCode, false);
    const unitsPerCode = units.reduce(
        (result, unit) => ({ ...result, [unit.code]: unit.id }),
        {},
    );

    const unitSections = _.flatten(
        parsedUnits
            .filter((unit) => !!unitsPerCode[unit.code])
            .map((unit) => {
                return unit.sections_cn.map((code, index) => ({
                    unit_id: unitsPerCode[unit.code],
                    section_cn_id: sectionsPerCode[code],
                    index,
                }));
            }),
    );
    const nbUnitSections = unitSections.length;
    global.console.log(`importing ${nbUnitSections}`);
    yield _.chunk(unitSections, 100).map((batch) => batchUpsert(batch));
    global.console.log('done');
})
    .catch(function (error) {
        global.console.error(error.stack);

        return error;
    })
    .then(function (error) {
        process.exit(error ? 1 : 0);
    });
