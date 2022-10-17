import koa from 'koa';
import route from 'koa-route';
import jwt from 'koa-jwt';
import send from 'koa-send';
import { auth } from 'config';
import { selectOneByGate } from '../../models/Community';

import generateEZTicket from '../../services/generateEZTicket';
import { login } from './login';
import loginTemplate from './loginTemplate';
import errorTemplate from './errorTemplate';
import getLanguage from '../../services/getLanguage';
import { selectEzTicketInfoForId as selectJanusEzTicketInfoForId } from '../../models/JanusAccount';
import { selectEzTicketInfoForId as selectInistEzTicketInfoForId } from '../../models/InistAccount';

const app = new koa();

app.use(
    route.get('/bibcnrs.png', function* () {
        yield send(this, 'bibcnrs.png', { root: __dirname });
    }),
);

app.use(
    route.get('/login', function* () {
        const language = getLanguage(this.request.headers);
        this.body = loginTemplate(language);
    }),
);

app.use(route.post('/login', login));

app.use(
    jwt({
        secret: auth.cookieSecret,
        cookie: 'bibapi_token',
        key: 'cookie',
        expiresIn: '10h',
        passthrough: true,
    }),
);

const getEzTicketInfo = function* (ctx) {
    if (ctx.inistAccount) {
        return {
            ...(yield selectInistEzTicketInfoForId(ctx.inistAccount.id)),
            domains: ctx.inistAccount.domains,
        };
    }
    if (!ctx.state.cookie) {
        return;
    }

    const { origin, id, domains } = ctx.state.cookie;
    switch (origin) {
        case 'inist':
            return {
                ...(yield selectInistEzTicketInfoForId(id)),
                domains,
            };
        case 'janus':
            return {
                ...(yield selectJanusEzTicketInfoForId(id)),
                domains,
            };
        default:
            return;
    }
};

app.use(function* () {
    const language = getLanguage(this.request.headers);
    if (!this.query.gate) {
        this.status = 500;
        this.body = errorTemplate(language, 'noGate');

        return;
    }

    const gate = this.query.gate.split('.')[0];
    let domain;
    try {
        domain = yield selectOneByGate(gate);
    } catch (e) {
        this.status = 500;
        this.body = errorTemplate(language, 'invalidGate', this.query.gate);
        return;
    }

    const ezTicketInfo = yield getEzTicketInfo(this);
    if (!ezTicketInfo) {
        this.redirect(
            `ezticket/login?gate=${encodeURIComponent(
                this.query.gate,
            )}&url=${encodeURIComponent(this.query.url)}`,
        );
        return;
    }

    if (
        !ezTicketInfo.domains ||
        ezTicketInfo.domains.indexOf(domain.name) === -1
    ) {
        this.status = 401;
        this.body = errorTemplate(language, 'unauthorized');
        return;
    }

    const url = generateEZTicket(
        this.query.gate,
        this.query.url,
        ezTicketInfo.username,
        ezTicketInfo.groups,
    );
    this.redirect(url);
});

export default app;
