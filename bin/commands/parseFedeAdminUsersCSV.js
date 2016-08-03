import csv from 'csv';
import path from 'path';
import fs from 'fs';
import co from 'co';
import config from 'config';
import _ from 'lodash';
import minimist from 'minimist';

import { pgClient } from 'co-postgres-queries';

import InistAccount from '../../lib/models/InistAccount';
import Institute from '../../lib/models/Institute';
import Unit from '../../lib/models/Unit';
import InistAccountUnit from '../../lib/models/InistAccountUnit';
import InistAccountInstitute from '../../lib/models/InistAccountInstitute';
import Domain from '../../lib/models/Domain';
import InistAccountDomain from '../../lib/models/InistAccountDomain';

const arg = minimist(process.argv.slice(2));

const colFieldMap = [
    'username', // Identifiant
    'password', // Mot de Passe
    'name', // Nom chercheur
    'firstname', // Prénom chercheur
    'mail', // Courriel chercheur
    'dr', // D.R. spécifique chercheur
    'unit', // Code de l'unité
    null, // domain_biblioinserm
    null, // domain_biblioplanets
    null, // domain_titanesciences
    null, // domain_bibliovie
    null, // domain_biblioshs
    null, // domain_bibliosciences
    null, // domain_archivesiop
    null, // domain_bibliost2i
    null, // domain_reaxys
    'domain_INC',
    'domain_INSB',
    'domain_INSMI',
    'domain_INP',
    'domain_IN2P3',
    'domain_INSHS',
    'domain_INSIS',
    'domain_INS2I',
    'domain_INSU',
    'domain_INEE',
    'main_institute_inserm', // Inserm (DS de ratt. du compte)
    'main_institute_dgds', // DGDS (DS de ratt. du compte)
    'main_institute_inc', // INC (DS de ratt. du compte)
    'main_institute_noncnrs', // NONCNRS (DS de ratt. du compte)
    'main_institute_insmi', // INSMI (DS de ratt. du compte)
    'main_institute_in2p3', // IN2P3 (DS de ratt. du compte)
    'main_institute_inp', // INP (DS de ratt. du compte)
    'main_institute_dgdr', // DGDR (DS de ratt. du compte)
    'main_institute_pdt', // PDT (DS de ratt. du compte)
    'main_institute_inee', // INEE (DS de ratt. du compte)
    'main_institute_insb', // INSB (DS de ratt. du compte)
    'main_institute_inshs', // INSHS (DS de ratt. du compte)
    'main_institute_insis', // INSIS (DS de ratt. du compte)
    'main_institute_insu', // INSU (DS de ratt. du compte)
    'main_institute_ins2i', // INS2I (DS de ratt. du compte)
    'main_institute_conrs', // CONRS (DS de ratt. du compte)
    'secondary_institutes_ins2i', // INS2I (DS sec. du compte)
    'secondary_institutes_insis', // INSIS (DS sec. du compte)
    'secondary_institutes_inserm', // Inserm (DS sec. du compte)
    'secondary_institutes_insb', // INSB (DS sec. du compte)
    'secondary_institutes_inc', // INC (DS sec. du compte)
    'secondary_institutes_inee', // INEE (DS sec. du compte)
    'secondary_institutes_insu', // INSU (DS sec. du compte)
    'secondary_institutes_inp', // INP (DS sec. du compte)
    'secondary_institutes_inshs', // INSHS (DS sec. du compte)
    'secondary_institutes_noncnrs', // NONCNRS (DS sec. du compte)
    'secondary_institutes_conrs', // CONRS (DS sec. du compte)
    'secondary_institutes_in2p3', // IN2P3 (DS sec. du compte)
    'secondary_institutes_insmi', // INSMI (DS sec. du compte)
    'comment', // Commentaire compte
    'subscription_date', // Date d'inscription
    'expiration_date', // Date d'expiration
    null, // Fournisseur d'identité
    null, // Intitulé de l'unité
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
    null, // Téléphone du CI
    null, // Courriel du CI
    null, // Inserm (DS de ratt. de l?unité)
    null, // DGDS (DS de ratt. de l?unité)
    null, // INC (DS de ratt. de l?unité)
    null, // PDT (DS de ratt. de l?unité)
    null, // NONCNRS (DS de ratt. de l?unité)
    null, // INSMI (DS de ratt. de l?unité)
    null, // IN2P3 (DS de ratt. de l?unité)
    null, // INP (DS de ratt. de l?unité)
    null, // DGDR (DS de ratt. de l?unité)
    null, // INEE (DS de ratt. de l?unité)
    null, // INSB (DS de ratt. de l?unité)
    null, // INSHS (DS de ratt. de l?unité)
    null, // INSIS (DS de ratt. de l?unité)
    null, // INSU (DS de ratt. de l?unité)
    null, // INS2I (DS de ratt. de l?unité)
    null, // CONRS (DS de ratt. de l?unité)
    null, // INSIS (DS sec. de l?unité)
    null, // INSU (DS sec. de l?unité)
    null, // INC (DS sec. de l?unité)
    null, // INP (DS sec. de l?unité)
    null, // INS2I (DS sec. de l?unité)
    null, // IN2P3 (DS sec. de l?unité)
    null, // INSMI (DS sec. de l?unité)
    null, // INSB (DS sec. de l?unité)
    null, // INEE (DS sec. de l?unité)
    null, // Inserm (DS sec. de l?unité)
    null, // INSHS (DS sec. de l?unité)
    null, // 10 (Sections CN de l'unité)
    null, // 11 (Sections CN de l'unité)
    null, // 12 (Sections CN de l'unité)
    null, // 13 (Sections CN de l'unité)
    null, // 14 (Sections CN de l'unité)
    null, // 15 (Sections CN de l'unité)
    null, // 41 (Sections CN de l'unité)
    null, // 1 (Sections CN de l'unité)
    null, // 3 (Sections CN de l'unité)
    null, // 17 (Sections CN de l'unité)
    null, // 18 (Sections CN de l'unité)
    null, // 2 (Sections CN de l'unité)
    null, // 4 (Sections CN de l'unité)
    null, // 5 (Sections CN de l'unité)
    null, // 8 (Sections CN de l'unité)
    null, // 20 (Sections CN de l'unité)
    null, // 28 (Sections CN de l'unité)
    null, // 50 (Sections CN de l'unité)
    null, // 6 (Sections CN de l'unité)
    null, // 7 (Sections CN de l'unité)
    null, // 9 (Sections CN de l'unité)
    null, // 21 (Sections CN de l'unité)
    null, // 19 (Sections CN de l'unité)
    null, // 16 (Sections CN de l'unité)
    null, // 24 (Sections CN de l'unité)
    null, // 26 (Sections CN de l'unité)
    null, // 29 (Sections CN de l'unité)
    null, // 30 (Sections CN de l'unité)
    null, // 37 (Sections CN de l'unité)
    null, // 25 (Sections CN de l'unité)
    null, // 31 (Sections CN de l'unité)
    null, // 23 (Sections CN de l'unité)
    null, // 32 (Sections CN de l'unité)
    null, // 22 (Sections CN de l'unité)
    null, // 27 (Sections CN de l'unité)
    null, // 36 (Sections CN de l'unité)
    null, // 39 (Sections CN de l'unité)
    null, // 51 (Sections CN de l'unité)
    null, // 54 (Sections CN de l'unité)
    null, // 38 (Sections CN de l'unité)
    null, // 34 (Sections CN de l'unité)
    null, // 35 (Sections CN de l'unité)
    null, // 33 (Sections CN de l'unité)
    null, // 40 (Sections CN de l'unité)
    null, // 52 (Sections CN de l'unité)
    null, // 53 (Sections CN de l'unité)
    null, // domain_biblioinserm
    null, // domain_biblioplanets
    null, // domain_titanesciences
    null, // domain_bibliovie
    null, // domain_biblioshs
    null, // domain_bibliosciences
    null, // domain_archivesiop
    null, // domain_bibliost2i
    null, // domain_reaxys
    null, // domain_INSMI
    null, // domain_INP
    null, // domain_IN2P3
    null, // domain_INC
    null, // domain_INSHS
    null, // domain_INSIS
    null, // domain_INS2I
    null, // domain_INSU
    null, // domain_INEE
    null, // domain_INSB
    null // Commentaire unité
];

const instituteCodeDictionary = {
    inserm: 'inserm',
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
    const inistAccountQueries = InistAccount(db);
    const instituteQueries = Institute(db);
    const inistAccountInstituteQueries = InistAccountInstitute(db);
    const unitQueries = Unit(db);
    const inistAccountUnitQueries = InistAccountUnit(db);
    const domainQueries = Domain(db);
    const inistAccountDomainQueries = InistAccountDomain(db);
    const filename = arg._[0];
    if (!filename) {
        global.console.error('You must specify a file to import');
        process.exit(1);
    }
    const filePath = path.join(__dirname, '/../../', filename);
    const file = fs.createReadStream(filePath, { encoding: 'utf8' });

    var parse = function (rawInistAccount) {
        if (rawInistAccount.length !== 174) {
            throw new Error('wrong csv format');
        }

        return rawInistAccount.reduce((inistAccount, col, index) => {
            const fieldName = colFieldMap[index];
            if (!fieldName) {
                return inistAccount;
            }
            if ((fieldName === 'subscription_date' || fieldName === 'expiration_date') && col === '0000-00-00') {
                col = null;
            }
            if (fieldName.match(/main_institute|secondary_institutes/)) {
                if (col === 'non') {
                    return inistAccount;
                }
                const name = instituteCodeDictionary[fieldName.split('_')[2]];
                if (!name) {
                    return inistAccount;
                }
                return {
                    ...inistAccount,
                    institutes: [
                        ...inistAccount.institutes,
                        name
                    ]
                };
            }
            if (fieldName.match(/domain/)) {
                if(col === 'non') {
                    return inistAccount;
                }
                const name = fieldName.split('_')[1];
                if(!name) {
                    return inistAccount;
                }
                return {
                    ...inistAccount,
                    domains: [
                        ...inistAccount.domains,
                        name
                    ]
                };
            }

            return {
                ...inistAccount,
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
            .pipe(csv.parse({delimiter: ';'}))
            .pipe(csv.transform(function (rawInistAccount) {
                try {
                    const parsedInistAccount = parse(rawInistAccount);
                    if (!parsedInistAccount || parsedInistAccount.username === 'Identifiant' || parsedInistAccount.institutes.indexOf('inserm') !== -1) {
                        return;
                    }
                    return parsedInistAccount;
                } catch (error) {
                    error.message = `On entry: ${rawInistAccount} Error: ${error.message}`;
                    throw error;
                }
            }, function (error, data) {
                if (error) {
                    reject(error);
                }
                resolve(data);
            }));
        });

    };

    const parsedInistAccounts = yield(yield load(file))
    .filter(data => !!data);
    const nbInistAccount = parsedInistAccounts.length;
    global.console.log(`importing ${nbInistAccount}`);

    const upsertedInistAccounts =  _.flatten(yield _.chunk(parsedInistAccounts, 100)
    .map(inistAccount => inistAccountQueries.batchUpsertPerUsername(inistAccount)))
    .map((inistAccount, index) => ({
        ...inistAccount,
        institutes: parsedInistAccounts[index].institutes,
        unit: parsedInistAccounts[index].unit,
        domains: parsedInistAccounts[index].domains
    }));

    const institutesCode = _.uniq(_.flatten(parsedInistAccounts.map(inistAccounts => inistAccounts.institutes)));
    const institutes = yield instituteQueries.selectByCodes(institutesCode);
    const institutesPerCode = institutes.reduce((result, institute) => ({ ...result, [institute.code]: institute.id }), {});

    const inistAccountInstitutes = _.flatten(upsertedInistAccounts.map(inistAccount => {
        return inistAccount.institutes
        .map((code, index) => ({ inist_account_id: inistAccount.id, institute_id: institutesPerCode[code], index }));
    }));

    global.console.log(`assigning ${inistAccountInstitutes.length} institutes to inistAccount`);
    yield _.chunk(inistAccountInstitutes, 100).map(batch => inistAccountInstituteQueries.batchUpsert(batch));

    const unitsCode = _.uniq(parsedInistAccounts.map(inistAccounts => inistAccounts.unit));
    const units = yield unitQueries.selectByCodes(unitsCode);
    const unitsPerCode = units.reduce((result, unit) => ({ ...result, [unit.code]: unit.id }), {});
    const inistAccountUnits = upsertedInistAccounts
    .map((inistAccount, index) => {
        if(!inistAccount.unit) {
            return null;
        }
        return { inist_account_id: inistAccount.id, unit_id: unitsPerCode[inistAccount.unit], index };
    })
    .filter(inistAccountUnit => !!inistAccountUnit);

    global.console.log(`assigning ${inistAccountUnits.length} units to inistAccount`);
    yield _.chunk(inistAccountUnits, 100).map(batch => inistAccountUnitQueries.batchUpsert(batch));

    const domainsNames = _.uniq(_.flatten(parsedInistAccounts.map(inistAccounts => inistAccounts.domains)));
    const domains = yield domainQueries.selectByNames(domainsNames);
    const domainsPerName = domains.reduce((result, domain) => ({ ...result, [domain.name]: domain.id }), {});

    const inistAccountDomains = _.flatten(upsertedInistAccounts.map(inistAccount => {
        return inistAccount.domains
        .map((name, index) => ({ inist_account_id: inistAccount.id, domain_id: domainsPerName[name], index }));
    }));

    global.console.log(`assigning ${inistAccountDomains.length} domains to inistAccount`);
    yield _.chunk(inistAccountDomains, 100).map(batch => inistAccountDomainQueries.batchUpsert(batch));

    global.console.log('done');
})
.catch(function (error) {
    global.console.error(error);

    return error;
})
.then(function (error) {
    process.exit(error ? 1 : 0);
});
