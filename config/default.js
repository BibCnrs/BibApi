export default {
    port: 3000,
    host: 'localhost',
    ebsco: {
        host: 'ebsco_host',
        resultsPerPage: 20
    },
    auth: {
        secret: 'secret',
        adminSecret: 'admin_secret'
    },
    EzProxy: {
        ticketSecret: 'ticket_secret'
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