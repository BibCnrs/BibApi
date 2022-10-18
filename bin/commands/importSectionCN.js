import csv from 'csv';
import path from 'path';
import fs from 'fs';
import co from 'co';
import minimist from 'minimist';

import { batchInsert } from '../../lib/models/SectionCN';

const arg = minimist(process.argv.slice(2));

const colFieldMap = [
    'code', // Code Section
    'name', // Intitulé
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
        if (rawSectionCN.length !== 2) {
            throw new Error('wrong csv format');
        }

        return rawSectionCN.reduce((sectionCN, col, index) => {
            const fieldName = colFieldMap[index];
            if (!fieldName) {
                return rawSectionCN;
            }

            return {
                ...sectionCN,
                [colFieldMap[index]]: col === '' ? null : col,
            };
        }, {});
    };

    var load = function (file) {
        return new Promise(function (resolve, reject) {
            file.pipe(csv.parse({ delimiter: ',', quote: '"' })).pipe(
                csv.transform(
                    function (rawSectionCN) {
                        try {
                            const parsedSectionCN = parse(rawSectionCN);
                            if (
                                !parsedSectionCN ||
                                parsedSectionCN.name === 'Intitulé section'
                            ) {
                                return;
                            }
                            return parsedSectionCN;
                        } catch (error) {
                            error.message = `On entry: ${rawSectionCN} Error: ${error.message}`;
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

    const parsedSectionsCN = (yield load(file)).filter((data) => !!data);
    const nbSections = parsedSectionsCN.length;
    global.console.log(`importing ${nbSections}`);
    yield batchInsert(parsedSectionsCN);
    global.console.log('done');
})
    .catch(function (error) {
        global.console.error(error.stack);

        return error;
    })
    .then(function (error) {
        process.exit(error ? 1 : 0);
    });
