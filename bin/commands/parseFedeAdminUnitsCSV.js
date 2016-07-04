import csv from 'csv';
import path from 'path';
import fs from 'fs';
import co from 'co';
import config from 'config';
import _ from 'lodash';
import minimist from 'minimist';

import { pgClient } from 'co-postgres-queries';

import Unit from '../../lib/models/Unit';
import Institute from '../../lib/models/Institute';
import UnitInstitute from '../../lib/models/UnitInstitute';
import Domain from '../../lib/models/Domain';
import UnitDomain from '../../lib/models/UnitDomain';

const arg = minimist(process.argv.slice(2));

const colFieldMap = [
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
    'main_institute_inserm',
    'main_institute_noncnrs',
    'main_institute_conrs',
    'main_institute_insb',
    'main_institute_ins2i',
    'main_institute_insis',
    'main_institute_insmi',
    'main_institute_inc',
    'main_institute_inshs',
    'main_institute_inee',
    'main_institute_inp',
    'main_institute_insu',
    'main_institute_in2p3',
    'main_institute_pdt',
    'main_institute_dgdr',
    'main_institute_dgds',
    'secondary_institute_inserm',
    'secondary_institute_inp',
    'secondary_institute_insb',
    'secondary_institute_insu',
    'secondary_institute_inee',
    'secondary_institute_inshs',
    'secondary_institute_inc',
    'secondary_institute_insis',
    'secondary_institute_ins2i',
    'secondary_institute_iNn2p3',
    'secondary_institute_insmi',
    null, // 20 (Sections CN)
    null, // 23 (Sections CN)
    null, // 28 (Sections CN)
    null, // 27 (Sections CN)
    null, // 22 (Sections CN)
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
    null, // 11 (Sections CN)
    null, // 14 (Sections CN)
    null, // 3 (Sections CN)
    null, // 10 (Sections CN)
    null, // 39 (Sections CN)
    null, // 8 (Sections CN)
    null, // 4 (Sections CN)
    null, // 5 (Sections CN)
    null, // 7 (Sections CN)
    null, // 18 (Sections CN)
    null, // 1 (Sections CN)
    null, // 17 (Sections CN)
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
    null, // domain_titanesciences
    'domain_INSMI',
    null, // domain_archivesiop
    'domain_INP',
    'domain_INSHS',
    null, // domain_biblioplanets
    'domain_INC',
    'domain_INS2I',
    'domain_IN2P3',
    'domain_INSIS',
    'domain_INSU',
    'domain_INEE',
    null, // domain_reaxys
    'comment',
    'nb_unit_account'
];

const instituteCodeDictionary = { //TODO complete me
    // inserm: 'inserm',
    // noncnrs: '',
    // conrs: '',
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
    // pdt: '',
    // dgdr: '',
    dgds: 'DS99'
};

co(function* () {
    const db = yield pgClient(`postgres://${config.postgres.user}:${config.postgres.password}@${config.postgres.host}:${config.postgres.port}/${config.postgres.name}`);
    const unitQueries = Unit(db);
    const instituteQueries = Institute(db);
    const unitInstituteQueries = UnitInstitute(db);
    const domainQueries = Domain(db);
    const unitDomainQueries = UnitDomain(db);
    const filename = arg._[0];
    if(!filename) {
        console.error('You must specify a file to import');
        process.exit(1);
    }
    const filePath = path.join(__dirname, '/../../', filename);
    const file = fs.createReadStream(filePath, { encoding: 'utf8' });

    var parse = function (rawUnit) {
        if(rawUnit.length !== 117) {
            throw new Error('wrong csv format');
        }

        return rawUnit.reduce((unit, col, index) => {
            const fieldName = colFieldMap[index];
            if(!fieldName) {
                return unit;
            }
            if (fieldName.match(/main_institute|secondary_institute/)) {
                if(col === 'non') {
                    return unit;
                }
                const name = instituteCodeDictionary[fieldName.split('_')[2]];
                if(!name) {
                    return unit;
                }
                return {
                    ...unit,
                    institutes: [
                        ...unit.institutes,
                        name
                    ]
                };
            }
            if (fieldName.match(/domain/)) {
                if(col === 'non') {
                    return unit;
                }
                const name = fieldName.split('_')[1];
                if(!name) {
                    return unit;
                }
                return {
                    ...unit,
                    domains: [
                        ...unit.domains,
                        name
                    ]
                };
            }

            return {
                ...unit,
                [colFieldMap[index]]: col === '' ? null : col
            };
        }, {
            institutes: [],
            domains: []
        });
    };

    var load = function (file) {
        return new Promise(function (resolve, reject) {
            file
            .pipe(csv.parse({ delimiter: ';' }))
            .pipe(csv.transform(function (rawUnit) {
                try {
                    const parsedUnit = parse(rawUnit);
                    if(!parsedUnit || parsedUnit.nb_researcher_cnrs === 'Nb. chercheurs CNRS') {
                        return;
                    }
                    return parsedUnit;
                } catch (error) {
                    error.message = `On entry: ${rawUnit} Error: ${error.message}`;
                    throw error;
                }
            }, function (error, data) {
                if(error) {
                    reject(error);
                }
                resolve(data);
            }));
        });

    };

    const parsedUnits = (yield load(file)).filter(data => !!data);

    const institutesCode = _.uniq(_.flatten(parsedUnits.map(unit => unit.institutes)));
    const institutes = yield instituteQueries.selectByCodes(institutesCode);
    const institutesPerCode = institutes.reduce((result, institute) => ({ ...result, [institute.code]: institute.id }), {});

    const domainNames = _.uniq(_.flatten(parsedUnits.map(unit => unit.domains)));
    const domains = yield domainQueries.selectByNames(domainNames);
    const domainsPerName = domains.reduce((result, domain) => ({ ...result, [domain.name]: domain.id }), {});

    const nbUnits = parsedUnits.length;
    global.console.log(`importing ${nbUnits}`);
    const upsertedUnits =  _.flatten(yield _.chunk(parsedUnits, 100).map(unit => unitQueries.batchUpsertPerCode(unit)))
    .map((unit, index) => ({ ...unit, institutes: parsedUnits[index].institutes, domains: parsedUnits[index].domains }));

    const unitInstitutes = _.flatten(upsertedUnits.map(unit => {
        return unit.institutes
        .map((code, index) => ({ unit_id: unit.id, institute_id: institutesPerCode[code], index }));

    }));
    global.console.log(`assigning ${unitInstitutes.length} institutes to unit`);
    yield _.chunk(unitInstitutes, 100).map(batch => unitInstituteQueries.batchUpsert(batch));

    const unitDomains = _.flatten(upsertedUnits.map(unit => {
        return unit.domains
        .map((name, index) => ({ unit_id: unit.id, domain_id: domainsPerName[name], index }));

    }));
    global.console.log(`assigning ${unitDomains.length} domains to unit`);
    yield _.chunk(unitDomains, 100).map(batch => unitDomainQueries.batchUpsert(batch));
    global.console.log('done');
})
.catch(function (error) {
    global.console.error(error);

    return error;
})
.then(function (error) {
    process.exit(error ? 1 : 0);
});
