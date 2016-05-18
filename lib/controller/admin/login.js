import jwt from 'koa-jwt';
import { auth } from 'config';
import body from 'co-body';

import AdminUser from '../../models/AdminUser';

export const login = function* login() {
    const adminUserQueries = AdminUser(this.postgres);
    const { username, password } = yield body(this);
    const user = yield adminUserQueries.authenticate(username, password);

    if (user) {
        this.body = {
            token: jwt.sign({
                username
            }, auth.adminSecret)
        };
        return;
    }

    this.status = 401;
};
