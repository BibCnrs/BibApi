import { exec } from 'child_process';

export default function command(instruction) {
    return new Promise(function (resolve, reject) {
        exec(instruction, function (error, stdout, stderr) {
            if (stderr) {
                global.console.error(stderr);
            }
            if (error) {
                return reject(error);
            }
            resolve(stdout);
        });
    });
}
