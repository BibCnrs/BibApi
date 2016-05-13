import koa from 'koa';
import route from 'koa-route';
import jwt from 'koa-jwt';
import { auth } from 'config';
import send from 'koa-send';
import User from '../../models/User';
import Domain from '../../models/Domain';

import generateEZTicket from '../../services/generateEZTicket';
import { login } from './login';

const app = koa();

app.use(route.get('/login', function* () { // TODO remove once janus is used
    yield send(this, 'login.html', { root: __dirname });
}));

app.use(route.post('/login', login)); // TODO remove once janus is used

app.use(jwt({ secret: auth.secret, passthrough: true })); // TODO remove once janus is used

app.use(function* () {
    const stateUser = this.state.user;
    const gate = this.query.gate.split('.')[0];
    const domain = yield Domain.findOne({ gate });

    if(!domain) {
        this.status = 500;
        this.body = `There is no domain for gate ${this.query.gate}`;
        return;
    }

    const user = stateUser && stateUser.username ? yield User.findOne({ username: stateUser.username }) : this.user;
    if (!user || user.domains.indexOf(domain.name) === -1) {
        this.redirect(`ezticket/login?gate=${encodeURIComponent(this.query.gate)}&url=${encodeURIComponent(this.query.url)}`); // TODO redirect to janus when available
        return;
    }

    const url = generateEZTicket(this.query.gate, this.query.url, user.username, yield user.gatesPromises);
    this.redirect(url);
});

export default app;
