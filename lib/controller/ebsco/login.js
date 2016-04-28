import jwt from 'koa-jwt';
import { auth } from 'config';

import RenaterHeader from '../../models/RenaterHeader';
import User from '../../models/User';

export const login = function* login() {
    const renaterHeader = new RenaterHeader(this.request.header);
    yield renaterHeader.save();

    const user = yield User.findOne({ username: renaterHeader.remote_user });

    if(!user || !user.domains || user.domains.length === 0) {
        return this.status = 401;
    }

    const cookie = renaterHeader.cookie.split(';').filter(value => value.match(/^_shibsession_/))[0];

    const token = jwt.sign({
        username: renaterHeader.remote_user,
        domains: user.domains
    }, auth.adminSecret);

    const domains = user.domains.map(domain => `domains=${domain}`).join('&');

    this.redirect(`${decodeURIComponent(this.query.origin)}?shib=${encodeURIComponent(cookie)}&token=${token}&${domains}&username=${encodeURIComponent(renaterHeader.remote_user)}`);
};
