import koa from 'koa';
import mount from 'koa-mount';
import route from 'koa-route';
// import jwt from 'koa-jwt';
// import { auth } from 'config';

import postgresCrud from '../../utils/postgresCrud';
import Unit from '../../models/Unit';
import Revue from '../../models/Revue';
import History from '../../models/History';
import SectionCN from '../../models/SectionCN';
import { login } from './login';
import janusAccountsRoutes from './janusAccountsRoutes';
import inistAccountsRoutes from './inistAccounts';
import adminUserRoutes from './adminUserRoutes';
import communityRoutes from './communityRoutes';
import databasesRoutes from './databasesRoutes';
import institutesRoutes from './institutesRoutes';

const app = new koa();
app.use(route.post('/login', login));

// app.use(jwt({ secret: auth.adminSecret }));

app.use(mount('/adminUsers', adminUserRoutes));
app.use(mount('/communities', communityRoutes));
app.use(mount('/janusAccounts', janusAccountsRoutes));
app.use(mount('/databases', databasesRoutes));

app.use(mount('/institutes', institutesRoutes));

app.use(mount('/inistAccounts', inistAccountsRoutes));
app.use(mount('/units', postgresCrud(Unit)));
app.use(mount('/histories', postgresCrud(History)));
app.use(mount('/section_cn', postgresCrud(SectionCN)));
app.use(mount('/revues', postgresCrud(Revue)));

export default app;
