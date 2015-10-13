'use strict';

import koaRouter from 'koa-router';
import * as session from '../services/ebscoSession';
import search from '../services/ebscoEdsSearch';
import config from 'config';

const router = koaRouter();

router.get('/search/:term', function* () {
    const { SessionToken } = yield session.getSession(config.ebsco.profile.vie);

    try {
        const result = yield search(this.params.term, SessionToken);
        this.body = result.SearchResult.Data.Records;
    } catch (error) {
        this.status = error.statusCode;
        this.body = error.error.ErrorDescription;
    }
});

export default router;
