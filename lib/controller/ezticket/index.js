import koa from 'koa';
import route from 'koa-route';
import jwt from 'koa-jwt';
import { auth } from 'config';
import send from 'koa-send';

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
    const user = stateUser && stateUser.username && stateUser.domains ? this.state.user : this.user;
    if (!user) {
        this.redirect(`${this.originalUrl.replace(/\?.*/, '').replace(this.url.replace(/\?.*/, ''), '')}/login?url=${encodeURIComponent(this.query.url)}`); // TODO redirect to janus when available
        return;
    }
    const url = generateEZTicket(this.query.url, user.username, user.domains);
    this.redirect(url);
});

export default app;
