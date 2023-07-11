import koa from 'koa';
import route from 'koa-route';
import jwt from 'koa-jwt';
import { auth } from 'config';
import _ from 'lodash';

import { getCommunities, selectOneByName } from '../../models/Community';

import ebscoToken from '../../services/ebscoToken';
import ebscoAuthentication from '../../services/ebscoAuthentication';
import ebscoSession from '../../services/ebscoSession';
import { articleSearch } from './articleSearch';
import { publicationSearch } from './publicationSearch';
import { articleRetrieve } from './articleRetrieve';
import { publicationRetrieve } from './publicationRetrieve';
import { login, renaterLogin, getLogin } from './login';
import { postProfile } from './profile';
import {
    deleteHistory,
    deleteHistories,
    getHistory,
    postHistory,
    countHistories,
    enableOrDisableAlert,
    enableOrDisableAllAlert,
} from './history';
import { domains } from './domains';
import { retrieveRis } from './retrieveRis';
import { database } from './database';
import sendMail from '../../services/sendMail';
import getSimilarUidAlertMail from '../../services/getSimilarUidAlertMail';
import { updateFavouriteResources } from './favouriteResources';
import { postSearchAlert, delSearchAlert } from './searchAlert';
import { redirectOA } from './oa';
import { getLicenses } from './license';
import { metadoreSearch } from './metadoreSearch';
import { logout } from './logout';
import { getContent } from './contentManagement';
import { getResources } from './resources';
import { getTestNew, getTestsNews } from './testsNews';

const app = new koa();

app.use(function* (next) {
    this.sendMail = sendMail;
    this.getSimilarUidAlertMail = getSimilarUidAlertMail;
    yield next;
});

app.use(route.get('/login_renater', renaterLogin));
app.use(route.post('/logout', logout));
app.use(route.post('/login', login));

app.use(route.get('/domains', domains));

app.use(route.post('/retrieve_ris', retrieveRis));

app.use(route.get('/databases', database));

app.use(route.get('/metadore/search', metadoreSearch));

app.use(route.get('/cms', getContent));

app.use(route.get('/resources', getResources));

app.use(function* (next) {
    const domainName = this.request.path.split('/')[1];
    // not search community for this url path
    if (
        ![
            'getLogin',
            'profile',
            'history',
            'histories',
            'favourite_resources',
            'search_alert',
            'oa',
            'oa_database',
            'licenses',
            'news',
        ].includes(domainName)
    ) {
        this.domain = yield selectOneByName(domainName);
    }
    yield next;
});

app.use(function* (next) {
    const allDomains = (yield getCommunities()).map((domain) => domain.name);
    this.ebscoToken = ebscoToken(
        this.redis,
        'guest',
        allDomains,
        ebscoSession,
        ebscoAuthentication,
    );
    yield next;
});

app.use(route.get('/oa_database', redirectOA));

app.use(route.get('/:domainName/publication/search', publicationSearch));

// On mets en place l'authentification pour toutes les routes suivantes
app.use(
    jwt({
        secret: auth.cookieSecret,
        cookie: 'bibapi_token',
        key: 'cookie',
    }),
);

app.use(route.get('/licenses', getLicenses));
app.use(route.get('/news', getTestsNews));
app.use(route.get('/news/:id', getTestNew));

app.use(route.get('/oa', redirectOA));

app.use(route.post('/getLogin', getLogin));
app.use(route.put('/favourite_resources/:id', updateFavouriteResources));
app.use(route.post('/profile', postProfile));
app.use(route.post('/history', postHistory));
app.use(route.get('/history', getHistory));
app.use(route.get('/history/disable', enableOrDisableAllAlert));
app.use(route.get('/history/disable/:id', enableOrDisableAlert));
app.use(route.delete('/history', deleteHistory));
app.use(route.delete('/histories', deleteHistories));
app.use(route.get('/histories/count', countHistories));

app.use(jwt({ secret: auth.headerSecret, key: 'header' }));

app.use(function* (next) {
    if (!this.state.header || !this.state.cookie) {
        return (this.status = 401);
    }
    if (!_.isEqual(this.state.header, this.state.cookie)) {
        return (this.status = 401);
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
app.use(route.get('/:domainName/article/retrieve', articleRetrieve));
app.use(
    route.get('/:domainName/publication/retrieve/:id', publicationRetrieve),
);
app.use(route.put('/search_alert', postSearchAlert));
app.use(route.del('/search_alert/:id', delSearchAlert));

export default app;
