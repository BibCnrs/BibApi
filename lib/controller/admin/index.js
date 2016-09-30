import koa from 'koa';
import mount from 'koa-mount';
import route from 'koa-route';
import jwt from 'koa-jwt';
import { auth } from 'config';

import crud from '../../utils/crud';
import postgresCrud from '../../utils/postgresCrud';
import JanusAccount from '../../models/JanusAccount';
import InistAccount from '../../models/InistAccount';
import AdminUser from '../../models/AdminUser';
import RenaterHeader from '../../models/RenaterHeader';
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
app.use(mount('/renaterHeaders', crud(RenaterHeader, '_id', '*')));

export default app;
