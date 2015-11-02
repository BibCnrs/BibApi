'use strict';

import koaRouter from 'koa-router';
import { search, searchPure } from './search';

const router = koaRouter();

router.get('/search/:term', search);

router.get('/searchpure/:term', searchPure);

export default router;
