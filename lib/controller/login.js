'use strict';

import koaRouter from 'koa-router';
import jwt from 'koa-jwt';
import { auth, ebsco } from 'config';
import body from 'co-body';

import User from '../models/User';
import * as session from '../services/ebscoSession';

const router = koaRouter();

router.post('/login', function* login() {
    const { username, password } = yield body(this);
    const user = yield User.authenticate(username, password);
    if (user) {
        const tokens = yield user.get('domains').map((domain) => [domain, session.getSession(ebsco.profile[domain])]);
        yield (tokens.map(([domain, response]) => this.redis.hsetAsync(username, domain, response.SessionToken)));
        this.body = {
            token: jwt.sign({
                username,
                domains: user.get('domains')
            }, auth.secret),
            domains: user.get('domains')
        };
        return;
    }

    this.status = 401;
});

export default router;
