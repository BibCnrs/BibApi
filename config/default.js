export default {
    port: 3000,
    host: 'localhost',
    ebsco: {
        host: 'ebscohost',
        proxy: process.env.http_proxy,
        resultsPerPage: 20
    },
    auth: {
        secret: process.env.secret,
        adminSecret: process.env.admin_secret
    },
    EzProxy: {
        ticketSecret: process.env.ticket_secret
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
    logs: true
};
