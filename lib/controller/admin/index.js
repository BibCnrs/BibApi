import koa from 'koa';
import mount from 'koa-mount';
import route from 'koa-route';
// import jwt from 'koa-jwt';
// import { auth } from 'config';

import postgresCrud from '../../utils/postgresCrud';
import Revue from '../../models/Revue';
import { login } from './login';
import janusAccountsRoutes from './janusAccountsRoutes';
import inistAccountsRoutes from './inistAccounts';
import adminUserRoutes from './adminUserRoutes';
import communityRoutes from './communityRoutes';
import databaseRoutes from './databaseRoutes';
import instituteRoutes from './instituteRoutes';
import unitRoutes from './unitRoutes';
import sectionCNRoutes from './sectionCNRoutes';
import historyRoutes from './historyRoutes';

const app = new koa();
app.use(route.post('/login', login));

// app.use(jwt({ secret: auth.adminSecret }));

app.use(mount('/adminUsers', adminUserRoutes));
app.use(mount('/communities', communityRoutes));
app.use(mount('/janusAccounts', janusAccountsRoutes));
app.use(mount('/databases', databaseRoutes));
app.use(mount('/institutes', instituteRoutes));
app.use(mount('/units', unitRoutes));
app.use(mount('/section_cn', sectionCNRoutes));

app.use(mount('/histories', historyRoutes));

app.use(mount('/inistAccounts', inistAccountsRoutes));
app.use(mount('/revues', postgresCrud(Revue)));

export default app;
