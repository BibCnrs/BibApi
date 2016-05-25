import koa from 'koa';
import mount from 'koa-mount';
import route from 'koa-route';
import jwt from 'koa-jwt';
import co from 'co';
import { auth } from 'config';

import crud from '../../utils/crud';
import User from '../../models/User';
import AdminUser from '../../models/AdminUser';
import RenaterHeader from '../../models/RenaterHeader';
import Institute from '../../models/Institute';
import Domain from '../../models/Domain';
import Unit from '../../models/Unit';
import { login } from './login';

const app = koa();
app.use(route.post('/login', login));

app.use(jwt({ secret: auth.adminSecret, expiresIn: '10h' }));

app.use(route.get('/users', function* (next) {
    yield next;
    this.body = yield this.body.map(user => co(function* () {
        return {
            ...user.toObject(),
            allDomains: (yield user.allDomains).map(d => d.name),
            institutes: yield user.institutes,
            units: yield user.units
        };
    }));
}));
app.use(mount('/users', crud(User, 'username', ['username', 'domains', 'primaryUnit', 'primaryInstitute', 'additionalUnits', 'additionalInstitutes'])));
app.use(mount('/adminUsers', crud(AdminUser, 'username', ['username'])));
app.use(mount('/domains', crud(Domain, 'name', ['name', 'gate', 'userId', 'password', 'profile'])));
app.use(mount('/renaterHeaders', crud(RenaterHeader, '_id', '*')));
app.use(mount('/institutes', crud(Institute, 'code', '*')));
app.use(mount('/units', crud(Unit, 'name', '*')));

export default app;
