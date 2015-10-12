'use strict';

import koaRouter from 'koa-router';
import * as session from '../services/ebscoSession';
import config from 'config';

const router = koaRouter();

router.get('/search', function* () {
    const sessionToken = yield session.getSession(config.ebsco.profile.vie);
    this.body = sessionToken;
});

export default router;
