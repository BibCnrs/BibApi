import koa from 'koa';
import route from 'koa-route';
import jwt from 'koa-jwt';
import { pureRoute, auth, ebsco } from 'config';

import getSessionToken from '../../services/getSessionToken';
import getAuthenticationToken from '../../services/getAuthenticationToken';
import * as ebscoSession from '../../services/ebscoSession';
import ebscoAuthentication from '../../services/ebscoAuthentication';
import { search, searchPure } from './search';
import { retrieve, retrievePure } from './retrieve';
import { retrievePdfLink } from './retrievePdfLink';
import Domain from '../../models/Domain';

const app = koa();

app.use(jwt({ secret: auth.secret }));
app.use(function* (next) {
    this.getAuthenticationToken = getAuthenticationToken(this.redis, ebscoAuthentication, ebsco);
    this.getSessionToken = getSessionToken(this.redis, this.state.user, ebscoSession, ebsco);
    yield next;
});

app.use(function* (next) {
    const domainName = this.request.url.split('/')[1];
    this.domain = yield Domain.findByName(domainName);
    yield next;
});

app.use(route.get('/:domainName/search/:term', search));
app.use(route.get('/:domainName/retrieve/:dbId/:an', retrieve));
app.use(route.get('/:domainName/retrieve_pdf/:dbId/:an', retrievePdfLink));

if (pureRoute) {
    app.use(route.get('/:domainName/searchPure/:term', searchPure));
    app.use(route.get('/:domainName/retrievePure/:dbId/:an', retrievePure));
}

export default app;
