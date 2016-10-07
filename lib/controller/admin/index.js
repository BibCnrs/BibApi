import koa from 'koa';
import mount from 'koa-mount';
import route from 'koa-route';
import jwt from 'koa-jwt';
import { auth } from 'config';

import postgresCrud from '../../utils/postgresCrud';
import JanusAccount from '../../models/JanusAccount';
import InistAccount from '../../models/InistAccount';
import AdminUser from '../../models/AdminUser';
import Institute from '../../models/Institute';
import Community from '../../models/Community';
import Unit from '../../models/Unit';
import { login } from './login';

const app = koa();
app.use(route.post('/login', login));

app.use(jwt({ secret: auth.adminSecret }));

app.use(mount('/janusAccounts', postgresCrud(JanusAccount)));
app.use(mount('/inistAccounts', postgresCrud(InistAccount)));
app.use(mount('/adminUsers', postgresCrud(AdminUser)));
app.use(mount('/communities', postgresCrud(Community)));
app.use(mount('/institutes', postgresCrud(Institute)));
app.use(mount('/units', postgresCrud(Unit)));

export default app;
