import body from 'co-body';
import jwt from 'koa-jwt';
import { auth } from 'config';

import { generateSalt } from '../../services/passwordHash';

export const login = function* login(next) {
    const { username, password } = yield body(this);

    const inistAccount = yield this.inistAccountQueries.authenticate(username, password);
    if (inistAccount) {
        const domains = inistAccount.all_domains;
        const groups = inistAccount.all_groups;

        const shib = yield generateSalt();
        const cookieToken = jwt.sign({
            username,
            all_domains: domains,
            all_groups :groups,
            shib
        }, auth.cookieSecret);

        const headerToken = jwt.sign({
            username,
            all_domains: domains,
            all_groups :groups,
        }, auth.headerSecret);

        yield this.redis.setAsync(shib, headerToken);

        this.cookies.set('bibapi_token', cookieToken, { httpOnly: true });
        this.user = inistAccount;

        return yield next;
    }

    this.status = 401;
};
