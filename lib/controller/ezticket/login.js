import body from 'co-body';
import jwt from 'koa-jwt';
import { auth } from 'config';

import { generateSalt } from '../../services/passwordHash';
import loginTemplate from './loginTemplate';
import getLanguage from '../../services/getLanguage';
import { authenticate } from '../../models/InistAccount';

export const login = function* login(next) {
    const { username, password } = yield body(this);

    const inistAccount = yield authenticate(username, password);
    if (inistAccount) {
        const { id, domains, groups } = inistAccount;

        const shib = yield generateSalt();

        const tokenData = {
            id,
            username,
            domains,
            groups,
            shib,
            origin: 'inist',
            exp: Math.ceil(Date.now() / 1000) + auth.expiresIn,
        };

        const cookieToken = jwt.sign(tokenData, auth.cookieSecret);

        const headerToken = jwt.sign(tokenData, auth.headerSecret);

        yield this.redis.setAsync(shib, headerToken);

        this.cookies.set('bibapi_token', cookieToken, {
            httpOnly: true,
        });
        this.inistAccount = inistAccount;

        return yield next;
    }
    const language = getLanguage(this.request.headers);
    this.status = 401;
    this.body = loginTemplate(language, 401);
};
