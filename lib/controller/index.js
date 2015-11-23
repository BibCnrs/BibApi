'use strict';

import koaRouter from 'koa-router';
import { pureRoute } from 'config';

import { search, searchPure } from './search';
import { retrieve, retrievePure } from './retrieve';

const router = koaRouter();

router.get('/search/:term', search);
router.get('/retrieve/:dbId/:an', retrieve);

if (pureRoute) {
    router.get('/searchPure/:term', searchPure);
    router.get('/retrievePure/:dbId/:an', retrievePure);
}

export default router;
