import csv from 'csv';
import path from 'path';
import fs from 'fs';
import co from 'co';

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
    'nb_resercher_nocnrs',
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
    null, // domain_bibliost2i
    null, // domain_titanesciences
    null, // domain_archivesiop
    null, // domain_biblioplanets
    null, // domain_reaxys
    'comment',
    'nb_unit_account'
];

co(function* () {
    const filePath = path.join(__dirname, '/../../liste_unites.csv');
    const file = fs.createReadStream(filePath);

    var parse = function (rawUnit) {
        if(rawUnit.length !== 107) {
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
                const name = fieldName.split('_')[2];
                return {
                    ...unit,
                    institutes: [
                        ...unit.institutes,
                        name
                    ]
                };
            }
            return {
                ...unit,
                [colFieldMap[index]]: col
            };
        }, {
            institutes: []
        });
    };

    var load = function (file) {
        return new Promise(function (resolve) {
            file.pipe(csv.parse({delimiter: ';'}))
            .pipe(csv.transform(function (rawUnit) {
                co(function* () {
                    const parsedUnit = parse(rawUnit);
                    console.log(parsedUnit);
                })
                .catch(error => {
                    console.error('on entry: ', rawUnit.join(','));
                    console.error(error.message);
                })
                .then(resolve);
            }));
        });

    };

    yield load(file);

})
.catch(function (error) {
    console.error(error);

    return error;
})
.then(function (error) {
    process.exit(error ? 1 : 0);
});
