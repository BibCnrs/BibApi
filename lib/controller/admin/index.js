import koa from 'koa';
import mount from 'koa-mount';
import route from 'koa-route';
import jwt from 'koa-jwt';
import { auth } from 'config';

import crud from '../../utils/crud';
import User from '../../models/User';
import AdminUser from '../../models/AdminUser';
import Domain from '../../models/Domain';
import { login } from './login';

const app = koa();
app.use(route.post('/login', login));

app.use(jwt({ secret: auth.adminSecret }));

app.use(mount('/users', crud(User, 'username', ['username', 'domains'])));
app.use(mount('/adminUsers', crud(AdminUser, 'username', ['username'])));
app.use(mount('/domains', crud(Domain, 'name', ['name', 'userId', 'password', 'profile'])));

export default app;
