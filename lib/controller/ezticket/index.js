import koa from 'koa';
import route from 'koa-route';
import jwt from 'koa-jwt';
import { auth } from 'config';
import send from 'koa-send';
import InistAccount from '../../models/InistAccount';
import JanusAccount from '../../models/JanusAccount';
import Domain from '../../models/Community';

import generateEZTicket from '../../services/generateEZTicket';
import { login } from './login';

const app = koa();

app.use(function* (next) {
    this.domainQueries = Domain(this.postgres);
    this.inistAccountQueries = InistAccount(this.postgres);
    this.janusAccountQueries = JanusAccount(this.postgres);
    yield next;
});

app.use(route.get('/login', function* () {
    yield send(this, 'login.html', { root: __dirname });
}));

app.use(route.post('/login', login));

app.use(jwt({ secret: auth.cookieSecret, cookie: 'bibapi_token', key: 'cookie', expiresIn: '10h', passthrough: true }));

const getEzTicketInfo = function* (ctx) {
    if(ctx.inistAccount) {
        return {
            ...yield ctx.inistAccountQueries.selectEzTicketInfoForIdQuery(ctx.inistAccount.id),
            domains: ctx.inistAccount.all_domains
        };
    }
    if(!ctx.state.cookie) {
        return;
    }

    const { origin, id, domains } = ctx.state.cookie;
    switch(origin) {
    case 'inist':
        return {
            ...yield ctx.inistAccountQueries.selectEzTicketInfoForIdQuery(id),
            domains
        };
    case 'janus':
        return {
            ...yield ctx.janusAccountQueries.selectEzTicketInfoForIdQuery(id),
            domains
        };
    default:
        return;
    }
};

app.use(function* () {
    const gate = this.query.gate.split('.')[0];
    const domain = yield this.domainQueries.selectOneByGate(gate);

    if(!domain) {
        this.status = 500;
        this.body = `There is no domain for gate ${this.query.gate}`;
        return;
    }

    const ezTicketInfo = yield getEzTicketInfo(this);
    if (!ezTicketInfo) {
        this.redirect(`ezticket/login?gate=${encodeURIComponent(this.query.gate)}&url=${encodeURIComponent(this.query.url)}`);
        return;
    }

    if (!ezTicketInfo.domains || ezTicketInfo.domains.indexOf(domain.name) === -1) {
        this.status = 401;
        return;
    }

    const url = generateEZTicket(this.query.gate, this.query.url, ezTicketInfo.username, ezTicketInfo.groups);
    this.redirect(url);
});

export default app;
