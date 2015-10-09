'use strict';

import koaRouter from 'koa-router';
const router = koaRouter();

router.get('/search', function* () {
    this.body = 'doing a search on EBSCO... SOON';
});

export default router;
