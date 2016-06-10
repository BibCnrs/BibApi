module.exports = {
    port: 3000,
    host: 'localhost',
    ebsco: {
        host: 'ebsco_host'
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
    postgres: {
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        name: process.env.POSTGRES_DB,
        host: process.env.POSTGRES_HOST,
        port: 5432
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
