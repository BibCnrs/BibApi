import body from 'co-body';

import User from '../../models/User';
import Domain from '../../models/Domain';

export const login = function* login(next) {
    const { username, password } = yield body(this);
    const gate = this.query.gate.split('.')[0];

    const domain = yield Domain.findOne({ gate });
    this.user = yield User.authenticate(username, password);

    if(!this.user || !domain || this.user.domains.indexOf(domain.name) === -1) {
        this.status = 401;
        return;
    }

    if (this.user) {
        return yield next;
    }

    this.status = 401;
};
