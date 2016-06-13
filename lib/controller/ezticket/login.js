import body from 'co-body';
import _ from 'lodash';
import jwt from 'koa-jwt';
import { auth } from 'config';
import { generateSalt } from '../../services/passwordHash';

export const login = function* login(next) {
    const { username, password } = yield body(this);

    const inistAccount = yield this.inistAccountQueries.authenticate(username, password);
    if (inistAccount) {
        const domains = _.uniq(
            inistAccount.institutes_domains
            .concat(inistAccount.units_domains)
            .concat(inistAccount.units_institutes_domains)
            .concat(inistAccount.domains)
        );

        const shib = yield generateSalt();
        const cookieToken = jwt.sign({
            username,
            domains,
            shib
        }, auth.cookieSecret);

        const headerToken = jwt.sign({
            username,
            domains
        }, auth.headerSecret);

        yield this.redis.setAsync(shib, headerToken);

        this.cookies.set('bibapi_token', cookieToken, { httpOnly: true });
        this.user = {
            ...inistAccount,
            domains
        };

        return yield next;
    }

    this.status = 401;
};
