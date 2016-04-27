export default {
    ebsco: {
        host: process.env.ebsco_host,
        proxy: process.env.http_proxy
    },
    auth: {
        secret: process.env.secret,
        adminSecret: process.env.admin_secret
    },
    EzProxy: {
        ticketSecret: process.env.ticket_secret
    }
};
