import koa from 'koa';
import route from 'koa-route';
import jwt from 'koa-jwt';
import { pureRoute, auth } from 'config';
import _ from 'lodash';

import Community from '../../models/Community';
import Institute from '../../models/Institute';
import Unit from '../../models/Unit';
import JanusAccount from '../../models/JanusAccount';
import InistAccount from '../../models/InistAccount';
import Database from '../../models/Database';
import History from '../../models/History';

import ebscoToken from '../../services/ebscoToken';
import ebscoAuthentication from '../../services/ebscoAuthentication';
import ebscoSession from '../../services/ebscoSession';
import { articleSearch, articleSearchPure } from './articleSearch';
import { publicationSearch, publicationSearchPure } from './publicationSearch';
import { articleRetrieve, batchArticleRetrieve, articleRetrievePure } from './articleRetrieve';
import { publicationRetrieve, publicationRetrievePure } from './publicationRetrieve';
import { login, renaterLogin, getLogin, loginAsTester } from './login';
import { postProfile } from './profile';
import { getHistory, postHistory } from './history';
import { domains } from './domains';
import { retrieveRis } from './retrieveRis';
import { database } from './database';

const app = koa();

app.use(function* (next) {
    this.communityQueries = Community(this.postgres);
    this.janusAccountQueries = JanusAccount(this.postgres);
    this.inistAccountQueries = InistAccount(this.postgres);
    this.instituteQueries = Institute(this.postgres);
    this.unitQueries = Unit(this.postgres);
    this.databaseQueries = Database(this.postgres);
    this.historyQueries = History(this.postgres);
    yield next;
});
app.use(route.get('/login_as_tester', loginAsTester));

app.use(route.get('/login_renater', renaterLogin));
app.use(route.post('/login', login));

app.use(route.get('/domains', domains));

app.use(route.post('/retrieve_ris', retrieveRis));

app.use(route.get('/databases', database));

app.use(function* (next) {
    const domainName = this.request.path.split('/')[1];
    if (!['getLogin', 'profile', 'history'].includes(domainName)) {
        this.domain = yield this.communityQueries.selectOneByName(domainName);
    }
    yield next;
});

app.use(function* (next) {
    const allDomains = (yield this.communityQueries.selectPage()).map(domain => domain.name);
    this.ebscoToken = ebscoToken(this.redis, 'guest', allDomains, ebscoSession, ebscoAuthentication);
    yield next;
});

app.use(route.get('/:domainName/publication/search', publicationSearch));

if (pureRoute) {
    app.use(route.get('/:domainName/publication/search/pure', publicationSearchPure));
}

app.use(jwt({ secret: auth.cookieSecret, cookie: 'bibapi_token', key: 'cookie' }));
app.use(route.post('/getLogin', getLogin));
app.use(route.post('/profile', postProfile));
app.use(route.post('/history', postHistory));
app.use(route.get('/history', getHistory));
app.use(jwt({ secret: auth.headerSecret, key: 'header' }));

app.use(function* (next) {
    if(!this.state.header || !this.state.cookie) {
        return this.status = 401;
    }
    if(!_.isEqual(this.state.header, this.state.cookie)) {
        return this.status = 401;
    }

    yield next;
});

app.use(function* (next) {
    this.ebscoToken
    .username(this.state.header.username)
    .domains(this.state.header.domains || []);
    yield next;
});

app.use(route.get('/:domainName/article/search', articleSearch));
app.use(route.get('/:domainName/article/retrieve/:dbId/:an', articleRetrieve));
app.use(route.post('/:domainName/article/batch_retrieve', batchArticleRetrieve));
app.use(route.get('/:domainName/publication/retrieve/:id', publicationRetrieve));


if (pureRoute) {
    app.use(route.get('/:domainName/article/search/pure', articleSearchPure));
    app.use(route.get('/:domainName/article/retrievePure/:dbId/:an', articleRetrievePure));
    app.use(route.get('/:domainName/publication/retrieve/pure/:id', publicationRetrievePure));
}

export default app;
