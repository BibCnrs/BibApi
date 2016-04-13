export default {
    port: 3000,
    host: 'localhost',
    ebsco: {
        host: 'ebscohost',
        proxy: process.env.http_proxy,
        resultsPerPage: 20
    },
    auth: {
        secret: null,
        adminSecret: null
    },
    redis: {
        port: 6379,
        host: 'redis'
    },
    pureRoute: false,
    allowedLimiters: [
        'FT',
        'DT1',
        'RV',
        'AU',
        'SO',
        'TI',
        'LA99'
    ],
    mongo: {
        dsn: 'mongodb://mongo/bibApi',
        options: {}
    },
    logs: true,
    EzProxy: {
        ticketSecret: null
    }
};
