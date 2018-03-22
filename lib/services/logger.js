import path from 'path';
import winston from 'winston';
import { logs } from 'config';

export default function logger(filename) {
    var transports = [
        new winston.transports.File({
            filename: path.join(__dirname, `/../../logs/${filename}`),
        }),
    ];

    if (logs) {
        transports.push(
            new winston.transports.Console({
                name: 'info',
                level: 'info',
                timestamp: true,
            }),
        );
    }

    return new winston.Logger({
        transports,
    });
}

export const httpLogger = logger('http.log');
export const ebscoLogger = logger('ebsco.log');
export const alertLogger = logger('alert.log');
