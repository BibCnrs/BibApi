'use strict';

import koaRouter from 'koa-router';
import jwt from 'koa-jwt';
import { auth } from 'config';
import body from 'co-body';
import { secure } from './secure';

import User from '../models/User';

const router = koaRouter();

router.post('/login', function* login() {
    const { username, password } = yield body(this);
    const user = yield User.authenticate(username, password);
    if (user) {
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

router.get('/secure', secure);

export default router;
