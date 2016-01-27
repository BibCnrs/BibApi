import koa from 'koa';
import mount from 'koa-mount';
import cors from 'koa-cors';

import crud from '../../utils/crud';
import User from '../../models/User';

const app = koa();

app.use(mount('/users', crud(User, 'username', ['username', 'domains'])));

export default app;
