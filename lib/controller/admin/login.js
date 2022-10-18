import jwt from 'koa-jwt';
import { auth } from 'config';
import body from 'co-body';
import { isPasswordValid } from '../../services/passwordHash';
import prisma from '../../prisma/prisma';

export const authenticate = function* authenticate(username, password) {
    const foundUser = yield prisma.admin_user.findUnique({
        where: {
            username,
        },
    });

    if (
        !foundUser ||
        !(yield isPasswordValid(password, foundUser.salt, foundUser.password))
    ) {
        return false;
    }

    return foundUser;
};

export const login = function* login() {
    const { username, password } = yield body(this);
    const user = yield authenticate(username, password);

    if (user) {
        this.body = {
            token: jwt.sign(
                {
                    username,
                    exp: Math.ceil(Date.now() / 1000) + auth.expiresIn,
                },
                auth.adminSecret,
            ),
        };
        return;
    }

    this.status = 401;
};
