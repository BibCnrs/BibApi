import koa from 'koa';
import mount from 'koa-mount';
import route from 'koa-route';
// import jwt from 'koa-jwt';
// import { auth } from 'config';

import postgresCrud from '../../utils/postgresCrud';
import Institute from '../../models/Institute';
import Unit from '../../models/Unit';
import Database from '../../models/Database';
import Revue from '../../models/Revue';
import History from '../../models/History';
import SectionCN from '../../models/SectionCN';
import { login } from './login';
import janusAccountsRoutes from './janusAccounts';
import inistAccountsRoutes from './inistAccounts';
import adminUserRoutes from './adminUserRoutes';
import communityRoutes from './communityRoutes';

const app = new koa();
app.use(route.post('/login', login));

// app.use(jwt({ secret: auth.adminSecret }));

app.use(mount('/adminUsers', adminUserRoutes));
app.use(mount('/communities', communityRoutes));
app.use(mount('/janusAccounts', janusAccountsRoutes));
app.use(mount('/inistAccounts', inistAccountsRoutes));
app.use(mount('/institutes', postgresCrud(Institute)));
app.use(mount('/units', postgresCrud(Unit)));
app.use(mount('/databases', postgresCrud(Database)));
app.use(mount('/histories', postgresCrud(History)));
app.use(mount('/section_cn', postgresCrud(SectionCN)));
app.use(mount('/revues', postgresCrud(Revue)));

export default app;
