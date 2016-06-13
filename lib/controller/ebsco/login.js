import jwt from 'koa-jwt';
import body from 'co-body';
import { auth } from 'config';
import _ from 'lodash';

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

    yield this.janusAccountQueries.upsertOnePerUsername({
        username: renaterHeader.remote_user,
        primary_institute: institute && institute.id,
        primary_unit: unit && unit.id
    });

    const user = yield this.janusAccountQueries.selectOneByUsername(renaterHeader.remote_user);

    const domains = _.uniq(
        user.primary_institute_domains
        .concat(user.additional_institutes_domains)
        .concat(user.primary_unit_domains)
        .concat(user.primary_unit_institutes_domains)
        .concat(user.additional_units_domains)
        .concat(user.additional_units_institutes_domains)
        .concat(user.domains)
    );

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
    const { username, password } = yield body(this);
    const inistAccount = yield this.inistAccountQueries.authenticate(username, password);

    if (inistAccount) {
        const domains = _.uniq(
            inistAccount.institutes_domains
            .concat(inistAccount.units_domains)
            .concat(inistAccount.units_institutes_domains)
            .concat(inistAccount.domains)
        );

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
