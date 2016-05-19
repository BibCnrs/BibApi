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
        institute: institute && institute.code,
        unit: unit && unit.name
    }, { upsert: true });

    const user = yield User.findOne({ username: renaterHeader.remote_user });

    const domains = (yield user.allDomains)
    .map(domain => domain.name);


    const token = jwt.sign({
        username: renaterHeader.remote_user,
        domains: domains
    }, auth.secret);

    const domainsParams = domains.map(domain => `domains=${domain}`).join('&');

    this.redirect(`${decodeURIComponent(this.query.origin)}?shib=${encodeURIComponent(cookie)}&token=${token}&${domainsParams}&username=${encodeURIComponent(renaterHeader.remote_user)}`);
};

export const login = function* login() {
    const { username, password } = yield body(this);
    const user = yield User.authenticate(username, password);
    if (user) {
        this.body = {
            token: jwt.sign({
                username,
                domains: user.get('domains')
            }, auth.secret),
            domains: user.get('domains'),
            username
        };
        return;
    }

    this.status = 401;
};
