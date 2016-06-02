module.exports = {
    ebsco: {
        host: process.env.ebsco_host,
        proxy: process.env.http_proxy
    },
    auth: {
        cookieSecret: process.env.cookie_secret,
        headerSecret: process.env.header_secret,
        adminSecret: process.env.admin_secret
    },
    EzProxy: {
        ticketSecret: process.env.ticket_secret
    }
};
