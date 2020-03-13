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
    route.get('/oa.png', function*() {
        yield send(this, 'oa.png', { root: __dirname });
    }),
);

app.use(mount('/admin', admin));
app.use(mount('/ebsco', ebsco));
app.use(mount('/ezticket', ezticket));

export default app;
