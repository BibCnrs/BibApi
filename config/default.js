module.exports = {
    alertTimeout: 1000 * 3600 * 3, // 3 hours
    port: 3000,
    host: 'localhost',
    api_endpoint: process.env.BIBAPI_HOST,
    ebsco: {
        host: process.env.ebsco_host,
        proxy: process.env.http_proxy,
    },
    crossref: 'http://api.crossref.org/works/',
    ez_unpaywall_url: process.env.EZ_UNPAYWALL_URL,
    ez_unpaywall_key: process.env.EZ_UNPAYWALL_KEY,
    auth: {
        cookieSecret: process.env.cookie_secret,
        headerSecret: process.env.header_secret,
        adminSecret: process.env.admin_secret,
        expiresIn: 10 * 3600, // 10 hours
    },
    EzProxy: {
        ticketSecret: process.env.ticket_secret,
    },
    redis: {
        port: 6379,
        host: process.env.REDIS_HOST ? process.env.REDIS_HOST : 'redis',
    },
    postgres: {
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        host: process.env.POSTGRES_HOST,
        port: 5432,
    },
    debugEbscoResult: false,
    fakeLogin: false,
    allowedLimiters: ['FT', 'DT1', 'RV', 'RV3', 'AU', 'SO', 'TI', 'LA99'],
    logs: true,
    maxSearchHistoryAgeInMonths: 2,
    mailServer: {
        host: process.env.MAIL_SERVER_HOST,
        port: process.env.MAIL_SERVER_PORT,
        from: 'bibcnrs@bib.cnrs.fr',
        to: 'assistance-portail@inist.fr',
    },
    metadore_url: process.env.METADORE_URL,
    metadore_api_key: process.env.METADORE_API_KEY,
    doaj_url: process.env.DOAJ_URL,
    content_delivery: {
        host: process.env.BIB_CONTENT_DELIVERY_HOST,
        internal_server: true,
    },
};
