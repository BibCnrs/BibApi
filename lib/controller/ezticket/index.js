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
import loginTemplate from './loginTemplate';
import getLanguage from '../../services/getLanguage';

const app = koa();

app.use(function* (next) {
    this.communityQueries = Domain(this.postgres);
    this.inistAccountQueries = InistAccount(this.postgres);
    this.janusAccountQueries = JanusAccount(this.postgres);
    yield next;
});

app.use(route.get('/bibcnrs.png', function* () {
    yield send(this, 'bibcnrs.png', { root: __dirname });
}));

app.use(route.get('/login', function* () {
    const language = getLanguage(this.request.headers);
    this.body = loginTemplate(language);
}));

app.use(route.post('/login', login));

app.use(jwt({ secret: auth.cookieSecret, cookie: 'bibapi_token', key: 'cookie', expiresIn: '10h', passthrough: true }));

const getEzTicketInfo = function* (ctx) {
    if(ctx.inistAccount) {
        return {
            ...yield ctx.inistAccountQueries.selectEzTicketInfoForId(ctx.inistAccount.id),
            domains: ctx.inistAccount.domains
        };
    }
    if(!ctx.state.cookie) {
        return;
    }

    const { origin, id, domains } = ctx.state.cookie;
    switch(origin) {
    case 'inist':
        return {
            ...yield ctx.inistAccountQueries.selectEzTicketInfoForId(id),
            domains
        };
    case 'janus':
        return {
            ...yield ctx.janusAccountQueries.selectEzTicketInfoForId(id),
            domains
        };
    default:
        return;
    }
};

app.use(function* () {
    if (!this.query.gate) {
        this.status = 500;
        this.body = 'Invalid gate';
        return;
    }

    const gate = this.query.gate.split('.')[0];
    const domain = yield this.communityQueries.selectOneByGate(gate);

    if (!domain) {
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
        yield send(this, '401.html', { root: __dirname });
        return;
    }

    const url = generateEZTicket(this.query.gate, this.query.url, ezTicketInfo.username, ezTicketInfo.groups);
    this.redirect(url);
});

export default app;
