import koa from 'koa';
import route from 'koa-route';
import jwt from 'koa-jwt';
import { pureRoute, auth, ebsco } from 'config';

import Domain from '../../models/Domain';
import getSessionToken from '../../services/getSessionToken';
import getAuthenticationToken from '../../services/getAuthenticationToken';
import * as ebscoSession from '../../services/ebscoSession';
import ebscoAuthentication from '../../services/ebscoAuthentication';
import { articleSearch, articleSearchPure } from './articleSearch';
import { publicationSearch, publicationSearchPure } from './publicationSearch';
import { retrieve, retrievePure } from './retrieve';
import { retrievePdfLink } from './retrievePdfLink';
import { login } from './login';

const app = koa();

app.use(route.post('/login', login));

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

app.use(route.get('/:domainName/article_search', articleSearch));
app.use(route.get('/:domainName/publication_search', publicationSearch));
app.use(route.get('/:domainName/retrieve/:dbId/:an', retrieve));
app.use(route.get('/:domainName/retrieve_pdf/:dbId/:an', retrievePdfLink));

if (pureRoute) {
    app.use(route.get('/:domainName/article_searchPure', articleSearchPure));
    app.use(route.get('/:domainName/publication_searchPure', publicationSearchPure));
    app.use(route.get('/:domainName/retrievePure/:dbId/:an', retrievePure));
}

export default app;
