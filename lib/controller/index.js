'use strict';

import koa from 'koa';
import route from 'koa-route';
import mount from 'koa-mount';
import { pureRoute, auth, ebsco } from 'config';

import { login } from './login';
import admin from './admin';
import { secure } from './secure';
import { search, searchPure } from './search';
import { retrieve, retrievePure } from './retrieve';
import { retrievePdfLink } from './retrievePdfLink';
import * as ebscoSession from '../services/ebscoSession';
import ebscoAuthentication from '../services/ebscoAuthentication';
import getSessionToken from '../services/getSessionToken';
import getAuthenticationToken from '../services/getAuthenticationToken';
import jwt from 'koa-jwt';

const app = koa();

app.use(route.get('/secure', secure));
app.use(mount('/admin', admin));
app.use(route.post('/login', login));


app.use(jwt({ secret: auth.secret }));
app.use(function* (next) {
    this.getAuthenticationToken = getAuthenticationToken(this.redis, ebscoAuthentication, ebsco);
    this.getSessionToken = getSessionToken(this.redis, this.state.user, ebscoSession, ebsco);
    yield next;
});

app.use(route.get('/search/:profile/:term', search));
app.use(route.get('/retrieve/:profile/:dbId/:an', retrieve));
app.use(route.get('/retrieve_pdf/:profile/:dbId/:an', retrievePdfLink));

if (pureRoute) {
    app.use(route.get('/searchPure/:profile/:term', searchPure));
    app.use(route.get('/retrievePure/:profile/:dbId/:an', retrievePure));
}


export default app;
