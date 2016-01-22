'use strict';

import koaRouter from 'koa-router';
import { pureRoute } from 'config';

import { search, searchPure } from './search';
import { retrieve, retrievePure } from './retrieve';
import { retrievePdfLink } from './retrievePdfLink';

const router = koaRouter();

router.get('/search/:profile/:term', search);
router.get('/retrieve/:profile/:dbId/:an', retrieve);
router.get('/retrieve_pdf/:profile/:dbId/:an', retrievePdfLink);

if (pureRoute) {
    router.get('/searchPure/:profile/:term', searchPure);
    router.get('/retrievePure/:profile/:dbId/:an', retrievePure);
}

export default router;
