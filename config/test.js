module.exports = {
    port: 3001,
    host: 'localhost',
    ebsco: {
        host: 'http://localhost',
        port: 3002,
    },
    auth: {
        headerSecret: 'changeme',
        cookieSecret: 'changemetoo',
        adminSecret: 'changeme',
        expiresIn: 10 * 3600, // 10 hours
    },
    EzProxy: {
        ticketSecret: 'secret',
    },
    logs: false,
    redis: {
        port: 6379,
        host: 'redis-test',
    },
    mailServer: {
        host: 'maildev-test',
        port: 25,
    },
    bibadmin_host: 'https://bibadmin_url',
    api_endpoint: 'http://localhost:3001',
};
