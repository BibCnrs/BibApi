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
import { articleRetrieve, articleRetrievePure } from './articleRetrieve';
import { publicationRetrieve, publicationRetrievePure } from './publicationRetrieve';
import { articleRetrievePdfLink } from './articleRetrievePdfLink';
import { login, renaterLogin } from './login';
import { domains } from './domains';

const app = koa();

app.use(route.get('/login_renater', renaterLogin));
app.use(route.post('/login', login));

app.use(route.get('/domains', domains));


app.use(function* (next) {
    const domainName = this.request.url.split('/')[1];
    this.domain = yield Domain.findByName(domainName);
    yield next;
});

app.use(function* (next) {
    this.getAuthenticationToken = getAuthenticationToken(this.redis, ebscoAuthentication, ebsco);
    const allDomains = (yield Domain.find()).map(domain => domain.name);
    this.getSessionToken = getSessionToken(this.redis, 'guest', allDomains, ebscoSession, ebsco);
    yield next;
});

app.use(route.get('/:domainName/publication/search', publicationSearch));

if (pureRoute) {
    app.use(route.get('/:domainName/publication/search/pure', publicationSearchPure));
}

app.use(jwt({ secret: auth.secret }));

app.use(function* (next) {
    this.getSessionToken
    .username(this.state.user.username)
    .domains(this.state.user.domains);
    yield next;
});

app.use(function* (next) {
    if(!this.state.user) {
        return this.status = 401;
    }
    yield next;
});

app.use(route.get('/:domainName/article/search', articleSearch));
app.use(route.get('/:domainName/article/retrieve/:dbId/:an', articleRetrieve));
app.use(route.get('/:domainName/article/retrieve_pdf/:dbId/:an', articleRetrievePdfLink));
app.use(route.get('/:domainName/publication/retrieve/:id', publicationRetrieve));


if (pureRoute) {
    app.use(route.get('/:domainName/article/search/pure', articleSearchPure));
    app.use(route.get('/:domainName/article/retrievePure/:dbId/:an', articleRetrievePure));
    app.use(route.get('/:domainName/publication/retrieve/pure/:id', publicationRetrievePure));
}

export default app;
