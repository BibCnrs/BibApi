import koa from 'koa';
import mount from 'koa-mount';
import route from 'koa-route';
import jwt from 'koa-jwt';
import { auth } from 'config';

import postgresCrud from '../../utils/postgresCrud';
import InistAccount from '../../models/InistAccount';
import AdminUser from '../../models/AdminUser';
import Institute from '../../models/Institute';
import Community from '../../models/Community';
import Unit from '../../models/Unit';
import Database from '../../models/Database';
import Revue from '../../models/Revue';
import History from '../../models/History';
import SectionCN from '../../models/SectionCN';
import { login } from './login';
import janusAccountsRoutes from './janusAccounts';

const app = koa();
app.use(route.post('/login', login));

app.use(jwt({ secret: auth.adminSecret }));

app.use(mount('/janusAccounts', janusAccountsRoutes));
app.use(mount('/inistAccounts', postgresCrud(InistAccount)));
app.use(mount('/adminUsers', postgresCrud(AdminUser)));
app.use(mount('/communities', postgresCrud(Community)));
app.use(mount('/institutes', postgresCrud(Institute)));
app.use(mount('/units', postgresCrud(Unit)));
app.use(mount('/databases', postgresCrud(Database)));
app.use(mount('/histories', postgresCrud(History)));
app.use(mount('/section_cn', postgresCrud(SectionCN)));
app.use(mount('/revues', postgresCrud(Revue)));

export default app;
