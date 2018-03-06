module.exports = {
    port: 3000,
    host: 'localhost',
    ebsco: {
        host: 'ebsco_host',
    },
    auth: {
        secret: 'secret',
        adminSecret: 'admin_secret',
        expiresIn: 10 * 3600, // 10 hours
    },
    EzProxy: {
        ticketSecret: 'ticket_secret',
    },
    redis: {
        port: 6379,
        host: 'redis',
    },
    postgres: {
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        host: process.env.POSTGRES_HOST,
        port: 5432,
    },
    pureRoute: false,
    fakeLogin: false,
    allowedLimiters: ['FT', 'DT1', 'RV', 'RV3', 'AU', 'SO', 'TI', 'LA99'],
    logs: true,
    maxSearchHistoryAgeInMonths: 2,
};
