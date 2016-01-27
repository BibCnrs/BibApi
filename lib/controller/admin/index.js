import koa from 'koa';
import mount from 'koa-mount';

import crud from '../../utils/crud';
import User from '../../models/User';
import Domain from '../../models/Domain';

const app = koa();

app.use(mount('/users', crud(User, 'username', ['username', 'domains'])));
app.use(mount('/domains', crud(Domain, 'name', ['name', 'userId', 'password', 'profile'])));

export default app;
