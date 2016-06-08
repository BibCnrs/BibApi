import koa from 'koa';
import mount from 'koa-mount';
import route from 'koa-route';
import jwt from 'koa-jwt';
import _ from 'lodash';
import { auth } from 'config';

import crud from '../../utils/crud';
import postgresCrud from '../../utils/postgresCrud';
import JanusAccount from '../../models/JanusAccount';
import InistAccount from '../../models/InistAccount';
import AdminUser from '../../models/AdminUser';
import RenaterHeader from '../../models/RenaterHeader';
import Institute from '../../models/Institute';
import Domain from '../../models/Domain';
import Unit from '../../models/Unit';
import { login } from './login';

const app = koa();
app.use(route.post('/login', login));

app.use(jwt({ secret: auth.adminSecret, expiresIn: '10h' }));

const addAlldomains = (user) => {
    return {
        ...user,
        all_domains: _.uniq(
            user.primary_institute_domains
            .concat(user.additional_institutes_domains)
            .concat(user.primary_unit_domains)
            .concat(user.primary_unit_institutes_domains)
            .concat(user.additional_units_domains)
            .concat(user.additional_units_institutes_domains)
            .concat(user.domains)
        )
    };
};

app.use(route.get('/users/:id', function* (_, next) {
    yield next;
    this.body = addAlldomains(this.body);
}));

app.use(route.get('/users', function* (next) {
    yield next;
    this.body = this.body.map(addAlldomains);
}));

app.use(mount('/janusAccounts', postgresCrud(JanusAccount)));
app.use(mount('/inistAccounts', postgresCrud(InistAccount)));
app.use(mount('/adminUsers', postgresCrud(AdminUser)));
app.use(mount('/domains', postgresCrud(Domain)));
app.use(mount('/institutes', postgresCrud(Institute)));
app.use(mount('/units', postgresCrud(Unit)));
app.use(mount('/renaterHeaders', crud(RenaterHeader, '_id', '*')));

export default app;
