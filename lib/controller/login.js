'use strict';

import koaRouter from 'koa-router';
import jwt from 'koa-jwt';
import { auth, ebsco } from 'config';
import body from 'co-body';

import * as session from '../services/ebscoSession';

const router = koaRouter();

router.post('/login', function* login() {
    const { username, password, profile } = yield body(this);

    if (username === auth.username && auth.password === password) {
        const { SessionToken } = yield session.getSession(ebsco.profile[profile]);
        yield this.redis.setAsync(username, SessionToken);

        this.body = {
            token: jwt.sign({
                username
            }, auth.secret)
        };
        return;
    }

    this.status = 401;
});

export default router;
