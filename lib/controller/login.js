'use strict';

import koaRouter from 'koa-router';
import jwt from 'koa-jwt';
import { auth } from 'config';
import body from 'co-body';

const router = koaRouter();

router.post('/login', function* login() {
    const { username, password } = yield body(this);

    if (username === auth.username && auth.password === password) {
        this.body = {
            token: jwt.sign(auth.payload, auth.secret)
        };
        return;
    }

    this.status = 401;
});

export default router;
