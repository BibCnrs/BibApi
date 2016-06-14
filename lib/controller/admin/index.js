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

const addAlldomainsForJanus = (janusAccount) => {
    return {
        ...janusAccount,
        all_domains: _.uniq(
            janusAccount.primary_institute_domains
            .concat(janusAccount.additional_institutes_domains)
            .concat(janusAccount.primary_unit_domains)
            .concat(janusAccount.primary_unit_institutes_domains)
            .concat(janusAccount.additional_units_domains)
            .concat(janusAccount.additional_units_institutes_domains)
            .concat(janusAccount.domains)
        )
    };
};

const addAlldomainsForInist = (inistAccount) => {
    return {
        ...inistAccount,
        all_domains: _.uniq(
            inistAccount.institutes_domains
            .concat(inistAccount.units_domains)
            .concat(inistAccount.units_institutes_domains)
            .concat(inistAccount.domains)
        )
    };
};

app.use(route.get('/janusAccounts/:id', function* (_, next) {
    yield next;
    this.body = addAlldomainsForJanus(this.body);
}));

app.use(route.get('/janusAccounts', function* (next) {
    yield next;
    this.body = this.body.map(addAlldomainsForJanus);
}));

app.use(route.get('/inistAccounts/:id', function* (_, next) {
    yield next;
    this.body = addAlldomainsForInist(this.body);
}));

app.use(route.get('/inistAccounts', function* (next) {
    yield next;
    this.body = this.body.map(addAlldomainsForInist);
}));

app.use(mount('/janusAccounts', postgresCrud(JanusAccount)));
app.use(mount('/inistAccounts', postgresCrud(InistAccount)));
app.use(mount('/adminUsers', postgresCrud(AdminUser)));
app.use(mount('/domains', postgresCrud(Domain)));
app.use(mount('/institutes', postgresCrud(Institute)));
app.use(mount('/units', postgresCrud(Unit)));
app.use(mount('/renaterHeaders', crud(RenaterHeader, '_id', '*')));

export default app;
