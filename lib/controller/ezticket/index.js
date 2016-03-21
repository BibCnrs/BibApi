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

app.use(function* (next) {
    try {
        yield next;
    } catch (err) {
        if (401 == err.status) {
            this.redirect('/ezticket/login'); // TODO redirect to janus when available
        } else {
            throw err;
        }
    }
});

app.use(jwt({ secret: auth.secret, passthrough: true })); // TODO remove once janus is used

app.use(function* () {
    if (!this.user) {
        this.status = 401;
        return;
    }
    const url = generateEZTicket(this.query.url, this.user.name, this.user.domains);
    this.redirect(url);
});

export default app;
