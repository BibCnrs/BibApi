import koa from 'koa';
import route from 'koa-route';
import jwt from 'koa-jwt';
import { pureRoute, auth, ebsco } from 'config';
import { assert } from 'chai';

import Domain from '../../models/Domain';
import Institute from '../../models/Institute';
import Unit from '../../models/Unit';
import JanusAccount from '../../models/JanusAccount';
import InistAccount from '../../models/InistAccount';

import sessionToken from '../../services/sessionToken';
import getAuthenticationToken from '../../services/getAuthenticationToken';
import * as ebscoSession from '../../services/ebscoSession';
import ebscoAuthentication from '../../services/ebscoAuthentication';
import { articleSearch, articleSearchPure } from './articleSearch';
import { publicationSearch, publicationSearchPure } from './publicationSearch';
import { articleRetrieve, batchArticleRetrieve, articleRetrievePure } from './articleRetrieve';
import { publicationRetrieve, publicationRetrievePure } from './publicationRetrieve';
import { articleRetrievePdfLink } from './articleRetrievePdfLink';
import { login, renaterLogin, getLogin } from './login';
import { domains } from './domains';
import { retrieveRis } from './retrieveRis';

const app = koa();

app.use(function* (next) {
    this.domainQueries = Domain(this.postgres);
    this.janusAccountQueries = JanusAccount(this.postgres);
    this.inistAccountQueries = InistAccount(this.postgres);
    this.instituteQueries = Institute(this.postgres);
    this.unitQueries = Unit(this.postgres);
    yield next;
});

app.use(route.get('/login_renater', renaterLogin));
app.use(route.post('/login', login));

app.use(route.get('/domains', domains));

app.use(route.post('/retrieve_ris', retrieveRis));


app.use(function* (next) {
    const domainName = this.request.url.split('/')[1];
    if (domainName !== 'getLogin') {
        this.domain = yield this.domainQueries.selectOneByName(domainName);
    }
    yield next;
});

app.use(function* (next) {
    this.getAuthenticationToken = getAuthenticationToken(this.redis, ebscoAuthentication, ebsco);
    const allDomains = (yield this.domainQueries.selectPage()).map(domain => domain.name);
    this.sessionToken = sessionToken(this.redis, 'guest', allDomains, ebscoSession, ebsco);
    yield next;
});

app.use(route.get('/:domainName/publication/search', publicationSearch));

if (pureRoute) {
    app.use(route.get('/:domainName/publication/search/pure', publicationSearchPure));
}

app.use(jwt({ secret: auth.cookieSecret, cookie: 'bibapi_token', key: 'cookie', expiresIn: '10h' }));
app.use(route.post('/getLogin', getLogin));
app.use(jwt({ secret: auth.headerSecret, key: 'header', expiresIn: '10h' }));

app.use(function* (next) {
    if(!this.state.header || !this.state.cookie) {
        return this.status = 401;
    }
    try {
        assert.deepEqual(this.state.header, this.state.cookie);
    } catch (e) {
        return this.status = 401;
    }

    yield next;
});

app.use(function* (next) {
    this.sessionToken
    .username(this.state.header.username)
    .domains(this.state.header.domains || []);
    yield next;
});

app.use(route.get('/:domainName/article/search', articleSearch));
app.use(route.get('/:domainName/article/retrieve/:dbId/:an', articleRetrieve));
app.use(route.post('/:domainName/article/batch_retrieve', batchArticleRetrieve));
app.use(route.get('/:domainName/article/retrieve_pdf/:dbId/:an', articleRetrievePdfLink));
app.use(route.get('/:domainName/publication/retrieve/:id', publicationRetrieve));


if (pureRoute) {
    app.use(route.get('/:domainName/article/search/pure', articleSearchPure));
    app.use(route.get('/:domainName/article/retrievePure/:dbId/:an', articleRetrievePure));
    app.use(route.get('/:domainName/publication/retrieve/pure/:id', publicationRetrievePure));
}

export default app;
