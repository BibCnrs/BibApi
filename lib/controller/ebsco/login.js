import jwt from 'koa-jwt';
import body from 'co-body';
import { auth } from 'config';

import RenaterHeader from '../../models/RenaterHeader';
import Institute from '../../models/Institute';
import Unit from '../../models/Unit';
import User from '../../models/User';

export const renaterLogin = function* login() {
    const renaterHeader = new RenaterHeader(this.request.header);
    yield renaterHeader.save();

    const cookie = renaterHeader.cookie && renaterHeader.cookie.split('; ').filter(value => value.match(/^_shibsession_/))[0];
    if (!cookie) {
        return this.status = 401;
    }

    const [ code, name ] = (renaterHeader.refscientificoffice || '').split('->');
    if (code && name) {
        yield Institute.findOneAndUpdate({ code }, { code, name }, { upsert: true });
    }
    const institute = yield Institute.findOne({ code });

    if(renaterHeader.ou) {
        yield Unit.findOneAndUpdate({ name: renaterHeader.ou }, { name: renaterHeader.ou }, { upsert: true });
    }
    const unit = yield Unit.findOne({ name: renaterHeader.ou });

    yield User.findOneAndUpdate({
        username: renaterHeader.remote_user
    }, {
        username: renaterHeader.remote_user,
        primaryInstitute: institute && institute.code,
        primaryUnit: unit && unit.name
    }, { upsert: true });

    const user = yield User.findOne({ username: renaterHeader.remote_user });

    const domains = (yield user.allDomains)
    .map(domain => domain.name);

    const cookieToken = jwt.sign({
        shib: cookie,
        username: renaterHeader.remote_user,
        domains
    }, auth.cookieSecret);

    const headerToken = jwt.sign({
        shib: cookie,
        username: renaterHeader.remote_user,
        domains
    }, auth.headerSecret);

    this.cookies.set('bibapi_token', cookieToken, { httpOnly: true });
    yield this.redis.setAsync(cookie, headerToken);

    this.redirect(`${decodeURIComponent(this.query.origin)}`);
};

export const getLogin = function* () {
    const token = yield this.redis.getAsync(this.state.cookie.shib);
    if(!token) {
        this.status = 401;
        return;
    }
    this.body = {
        username: this.state.cookie.username,
        domains: this.state.cookie.domains,
        token
    };

    yield this.redis.delAsync(this.state.cookie.shib);
};

export const login = function* login() {
    const userQueries = User(this.postgres);
    const { username, password } = yield body(this);
    const user = yield userQueries.authenticate(username, password);

    if (user) {
        const domains = user.domains;
        const cookieToken = jwt.sign({
            username,
            domains
        }, auth.cookieSecret);

        const headerToken = jwt.sign({
            username,
            domains
        }, auth.headerSecret);

        this.cookies.set('bibapi_token', cookieToken, { httpOnly: true });

        this.body = {
            token: headerToken,
            domains,
            username
        };

        return;
    }

    this.status = 401;
};
