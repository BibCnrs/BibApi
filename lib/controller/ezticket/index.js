import koa from 'koa';
import route from 'koa-route';
import jwt from 'koa-jwt';
import { auth } from 'config';
import send from 'koa-send';
import InistAccount from '../../models/InistAccount';
import Domain from '../../models/Domain';
import { assert } from 'chai';

import generateEZTicket from '../../services/generateEZTicket';
import { login } from './login';

const app = koa();

app.use(function* (next) {
    this.domainQueries = Domain(this.postgres);
    this.inistAccountQueries = InistAccount(this.postgres);
    yield next;
});

app.use(route.get('/login', function* () {
    yield send(this, 'login.html', { root: __dirname });
}));

app.use(route.post('/login', login));

app.use(jwt({ secret: auth.cookieSecret, cookie: 'bibapi_token', key: 'cookie', expiresIn: '10h', passthrough: true }));

app.use(function* () {
    const stateUser = this.state.cookie;
    const gate = this.query.gate.split('.')[0];
    const domain = yield this.domainQueries.selectOneByGate(gate);

    if(!domain) {
        this.status = 500;
        this.body = `There is no domain for gate ${this.query.gate}`;
        return;
    }

    const inistAccount = stateUser && stateUser.username ? yield this.inistAccountQueries.selectOneByUsername({ username: stateUser.username }) : this.user;
    if (!inistAccount || inistAccount.domains.indexOf(domain.name) === -1) {
        this.redirect(`ezticket/login?gate=${encodeURIComponent(this.query.gate)}&url=${encodeURIComponent(this.query.url)}`);
        return;
    }

    const domains = yield this.domainQueries.selectByInistAccountId(inistAccount.id);

    const url = generateEZTicket(this.query.gate, this.query.url, inistAccount.username, domains.map(d => d.gate));
    this.redirect(url);
});

export default app;
