import koa from 'koa';
import mount from 'koa-mount';
import route from 'koa-route';
import jwt from 'koa-jwt';
import { auth } from 'config';

import { login } from './login';
import janusAccountsRoutes from './janusAccountsRoutes';
import inistAccountsRoutes from './inistAccountsRoutes';
import adminUserRoutes from './adminUserRoutes';
import communityRoutes from './communityRoutes';
import databaseRoutes from './databaseRoutes';
import instituteRoutes from './instituteRoutes';
import unitRoutes from './unitRoutes';
import sectionCNRoutes from './sectionCNRoutes';
import historyRoutes from './historyRoutes';
import revueRoutes from './revueRoutes';
import licenseRoutes from './licenseRoutes';
import contentManagementRoutes from './contentManagementRoutes';
import mediaRoutes from './mediaRoutes';
import resourcesRoutes from './resourcesRoutes';
import testsNewsRoute from './testsNewsRoute';

const app = new koa();
app.use(route.post('/login', login));

app.use(jwt({ secret: auth.adminSecret }));

app.use(mount('/adminUsers', adminUserRoutes));
app.use(mount('/communities', communityRoutes));
app.use(mount('/janusAccounts', janusAccountsRoutes));
app.use(mount('/databases', databaseRoutes));
app.use(mount('/institutes', instituteRoutes));
app.use(mount('/units', unitRoutes));
app.use(mount('/section_cn', sectionCNRoutes));
app.use(mount('/histories', historyRoutes));
app.use(mount('/revues', revueRoutes));
app.use(mount('/inistAccounts', inistAccountsRoutes));
app.use(mount('/licenses', licenseRoutes));
app.use(mount('/contentManagement', contentManagementRoutes));
app.use(mount('/medias', mediaRoutes));
app.use(mount('/resources', resourcesRoutes));
app.use(mount('/news', testsNewsRoute));

export default app;
