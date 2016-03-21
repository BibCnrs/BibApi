import body from 'co-body';

import User from '../../models/User';

export const login = function* login(next) {
    const { username, password } = yield body(this);
    this.user = yield User.authenticate(username, password);

    if (this.user) {
        return yield next;
    }

    this.status = 401;
};
