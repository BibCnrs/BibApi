import path from 'path';
import winston from 'winston';
import { logs } from 'config';

export default function logger(filename) {
    let transports = [
        new winston.transports.File({
            filename: path.join(__dirname, `/../../logs/${filename}`),
        }),
    ];

    if (logs) {
        transports.push(
            new winston.transports.Console({
                name: 'info',
                level: 'info',
            }),
        );
    }

    return winston.createLogger({
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
        ),
        transports: [...transports],
    });
}

export const httpLogger = logger('bibapi_http.log');
export const ebscoLogger = logger('ebsco.log');
export const alertLogger = logger('alert.log');
export const filesLogger = logger('files.log');
