import winston from 'winston';
import config from 'config';

let transports = [];

if (config.logs) {
    transports.push(new (winston.transports.Console)({
        name: 'info',
        level: 'info',
        timestamp: true
    }));
}

export default new (winston.Logger)({
    transports
});
