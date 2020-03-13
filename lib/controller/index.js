'use strict';

import koa from 'koa';
import mount from 'koa-mount';
import route from 'koa-route';
import send from 'koa-send';

import admin from './admin';
import ebsco from './ebsco';
import ezticket from './ezticket';

const app = koa();

app.use(
    route.get('/bibcnrspng', function*() {
        yield send(this, 'public/bibcnrs.png');
    }),
);

app.use(
    route.get('/oapng', function*() {
        yield send(this, 'public/oa.png');
    }),
);

app.use(mount('/admin', admin));
app.use(mount('/ebsco', ebsco));
app.use(mount('/ezticket', ezticket));

export default app;
