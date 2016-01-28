import koa from 'koa';
import mount from 'koa-mount';
import jwt from 'koa-jwt';

import crud from '../../utils/crud';
import User from '../../models/User';
import AdminUser from '../../models/AdminUser';
import Domain from '../../models/Domain';

const app = koa();

app.use(mount('/users', crud(User, 'username', ['username', 'domains'])));
app.use(mount('/adminUsers', crud(AdminUser, 'login', ['login'])));
app.use(mount('/domains', crud(Domain, 'name', ['name', 'userId', 'password', 'profile'])));

export default app;
