import koa from 'koa';
import mount from 'koa-mount';
import route from 'koa-route';
import jwt from 'koa-jwt';
import co from 'co';
import { auth } from 'config';

import crud from '../../utils/crud';
import postgresCrud from '../../utils/postgresCrud';
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


app.use(mount('/users', postgresCrud(User)));
app.use(mount('/adminUsers', postgresCrud(AdminUser)));
app.use(mount('/domains', postgresCrud(Domain)));
app.use(mount('/renaterHeaders', crud(RenaterHeader, '_id', '*')));
app.use(mount('/institutes', crud(Institute, 'code', '*')));
app.use(mount('/units', crud(Unit, 'name', '*')));

export default app;
