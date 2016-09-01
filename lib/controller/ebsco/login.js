import jwt from 'koa-jwt';
import body from 'co-body';
import { auth } from 'config';

import RenaterHeader from '../../models/RenaterHeader';

export const renaterLogin = function* login() {
    const renaterHeader = new RenaterHeader(this.request.header);
    yield renaterHeader.save();

    const cookie = renaterHeader.cookie && renaterHeader.cookie.split('; ').filter(value => value.match(/^_shibsession_/))[0];
    if (!cookie) {
        return this.status = 401;
    }
    const [ code, name ] = (renaterHeader.refscientificoffice || '').split('->');
    if (code && name) {
        yield this.instituteQueries.upsertOnePerCode({ code, name: decodeURIComponent(escape(name)) });
    }
    const institute = yield this.instituteQueries.selectOneByCode({ code });

    if(renaterHeader.ou) {
        yield this.unitQueries.upsertOnePerCode({ code: renaterHeader.ou });
    }
    const unit = renaterHeader.ou ? yield this.unitQueries.selectOneByCode({ code: renaterHeader.ou }) : null;

    yield this.janusAccountQueries.upsertOnePerUid({
        uid: renaterHeader.uid,
        name: renaterHeader.sn,
        firstname: renaterHeader.givenname,
        mail: renaterHeader.mail,
        cnrs: renaterHeader.o === 'CNRS',
        last_connexion: renaterHeader['shib-authentication-instant'],
        primary_institute: institute && institute.id,
        primary_unit: unit && unit.id
    });

    const user = yield this.janusAccountQueries.selectOneByUid(renaterHeader.uid);

    const domains = user.all_domains;

    const tokenData = {
        id: user.id,
        shib: cookie,
        username: `${user.firstname} ${user.name}`,
        domains,
        origin: 'janus'
    };

    const cookieToken = jwt.sign(tokenData, auth.cookieSecret);

    const headerToken = jwt.sign(tokenData, auth.headerSecret);

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
    const { username, password } = yield body(this);
    const inistAccount = yield this.inistAccountQueries.authenticate(username, password);

    if (inistAccount) {
        const { id, all_domains: domains, all_groups: groups } = inistAccount;

        const tokenData = {
            id,
            username,
            domains,
            groups,
            origin: 'inist'
        };
        const cookieToken = jwt.sign(tokenData, auth.cookieSecret);

        const headerToken = jwt.sign(tokenData, auth.headerSecret);

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
