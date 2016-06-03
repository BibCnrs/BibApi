import csv from 'csv';
import path from 'path';
import fs from 'fs';
import co from 'co';

const colFieldMap = [
    'Code de l\'unit�',
    'Intitul�',
    'Organisme de Rattachement',
    'B�timent',
    'Rue',
    'Bo�te Postale',
    'Code Postal',
    'Ville',
    'Pays',
    'DR de l\'unit�',
    'Nb. chercheurs CNRS',
    'Nb. chercheurs NON CNRS',
    'Nb. DOCTORANTS',
    'Nb. POST-DOCTORANTS',
    'Nom du Directeur',
    'Pr�nom du Directeur',
    'Courriel du Directeur',
    'Correspondant Documentaire',
    'T�l�phone CD',
    'Courriel CD',
    'Correspondant Informatique',
    'T�l�phone CI',
    'Courriel CI',
    'Inserm (DS de ratt. de l?unit�)',
    'NONCNRS (DS de ratt. de l?unit�)',
    'CONRS (DS de ratt. de l?unit�)',
    'INSB (DS de ratt. de l?unit�)',
    'INS2I (DS de ratt. de l?unit�)',
    'INSIS (DS de ratt. de l?unit�)',
    'INSMI (DS de ratt. de l?unit�)',
    'INC (DS de ratt. de l?unit�)',
    'INSHS (DS de ratt. de l?unit�)',
    'INEE (DS de ratt. de l?unit�)',
    'INP (DS de ratt. de l?unit�)',
    'INSU (DS de ratt. de l?unit�)',
    'IN2P3 (DS de ratt. de l?unit�)',
    'PDT (DS de ratt. de l?unit�)',
    'DGDR (DS de ratt. de l?unit�)',
    'DGDS (DS de ratt. de l?unit�)',
    'Inserm (DS sec. de l?unit�)',
    'INP (DS sec. de l?unit�)',
    'INSB (DS sec. de l?unit�)',
    'INSU (DS sec. de l?unit�)',
    'INEE (DS sec. de l?unit�)',
    'INSHS (DS sec. de l?unit�)',
    'INC (DS sec. de l?unit�)',
    'INSIS (DS sec. de l?unit�)',
    'INS2I (DS sec. de l?unit�)',
    'IN2P3 (DS sec. de l?unit�)',
    'INSMI (DS sec. de l?unit�)',
    '20 (Sections CN)',
    '23 (Sections CN)',
    '28 (Sections CN)',
    '27 (Sections CN)',
    '22 (Sections CN)',
    '24 (Sections CN)',
    '29 (Sections CN)',
    '6 (Sections CN)',
    '9 (Sections CN)',
    '41 (Sections CN)',
    '12 (Sections CN)',
    '13 (Sections CN)',
    '15 (Sections CN)',
    '16 (Sections CN)',
    '2 (Sections CN)',
    '34 (Sections CN)',
    '19 (Sections CN)',
    '11 (Sections CN)',
    '14 (Sections CN)',
    '3 (Sections CN)',
    '10 (Sections CN)',
    '39 (Sections CN)',
    '8 (Sections CN)',
    '4 (Sections CN)',
    '5 (Sections CN)',
    '7 (Sections CN)',
    '18 (Sections CN)',
    '1 (Sections CN)',
    '17 (Sections CN)',
    '30 (Sections CN)',
    '36 (Sections CN)',
    '21 (Sections CN)',
    '26 (Sections CN)',
    '31 (Sections CN)',
    '32 (Sections CN)',
    '37 (Sections CN)',
    '35 (Sections CN)',
    '54 (Sections CN)',
    '38 (Sections CN)',
    '25 (Sections CN)',
    '52 (Sections CN)',
    '51 (Sections CN)',
    '33 (Sections CN)',
    '53 (Sections CN)',
    '40 (Sections CN)',
    '50 (Sections CN)',
    'BiblioInserm (Communaut�s)',
    'BiblioVie (Communaut�s)',
    'BiblioSHS (Communaut�s)',
    'BiblioSciences (Communaut�s)',
    'BiblioST2I (Communaut�s)',
    'TitaneSciences (Communaut�s)',
    'ArchivesIOP (Communaut�s)',
    'BiblioPlanets (Communaut�s)',
    'Reaxys (Communaut�s)',
    'Commentaire unit�',
    'Nombre de comptes de l\'unit�'
];

co(function* () {
    const filePath = path.join(__dirname, '/../../liste_unites.csv');
    const file = fs.createReadStream(filePath);

    var parse = function (rawUnit) {
        // console.log(rawUnit);
        if(rawUnit.length !== 107) {
            throw new Error('wrong csv format');
        }

        return rawUnit.reduce((unit, col, index) => {
            return {
                ...unit,
                [colFieldMap[index]]: col
            };
        }, {});
    };

    var load = function (file) {
        return function (done) {
            file.pipe(csv.parse({delimiter: ';'}))
            .pipe(csv.transform(function (rawUnit) {
                try {
                    console.log(parse(rawUnit));
                } catch (error) {
                    console.error('on entry: ', rawUnit.join(','));
                    console.error(error.message);
                }
                done();
            }));
        };

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
