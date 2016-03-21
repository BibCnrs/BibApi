import body from 'co-body';

import User from '../../models/User';

export const login = function* login(next) {
    const { username, password } = yield body(this);
    const user = yield User.authenticate(username, password);

    if (user) {
        this.user = {
            name: username,
            domains: user.get('domains')
        };
        return yield next;
    }

    this.status = 401;
};
