'use strict';

import koaRouter from 'koa-router';
import session from './session';

const router = koaRouter();

router.post('/edsapi/rest/CreateSession', session);

export default router;
