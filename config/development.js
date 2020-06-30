module.exports = {
    ebsco: {
        host: 'https://eds-api.ebscohost.com',
    },
    auth: {
        headerSecret: 'secret1',
        cookieSecret: 'secret2',
        adminSecret: 'secret3',
        expiresIn: 36000,
    },
    EzProxy: {
        ticketSecret: 'ez-proxy-secret',
    },
    debugEbscoResult: true,
    fakeLogin: true,
    mailServer: {
        host: process.env.MAIL_SERVER_HOST,
        port: process.env.MAIL_SERVER_PORT,
    },
    bibadmin_host: 'http://localhost:3011/public',
};
