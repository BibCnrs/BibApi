import body from 'co-body';


export const login = function* login(next) {
    const { username, password } = yield body(this);
    const gate = this.query.gate.split('.')[0];

    const domain = yield this.domainQueries.selectOneByGate(gate);
    this.user = yield this.inistAccountQueries.authenticate(username, password);

    if(!this.user || !domain || this.user.domains.indexOf(domain.name) === -1) {
        this.status = 401;
        return;
    }

    if (this.user) {
        return yield next;
    }

    this.status = 401;
};
