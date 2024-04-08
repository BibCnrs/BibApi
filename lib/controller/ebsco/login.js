import config, { auth } from 'config';
import jwt from 'koa-jwt';
import body from 'co-body';
import iconv from 'iconv-lite';
import {
    getFavouriteResources,
    getSimilarAccount,
    selectOneByUid,
    upsertOnePerUid,
} from '../../models/JanusAccount';
import { insertInstituteIfNotExists } from '../../models/Institute';
import { selectOneByCode, upsertOnePerCode } from '../../models/Unit';
import { getRevuesByDomains } from '../../models/Revue';
import { authenticate, updateLastConnexion } from '../../models/InistAccount';

const decode = (value) => {
    if (!value) {
        return undefined;
    }

    return iconv.decode(new Buffer(value, 'binary'), 'utf-8');
};

export const renaterLogin = function* login() {
    const renaterHeader = config.fakeLogin
        ? {
              cookie: '_shibsession_id=_sessionid',
              sn: 'marmelab',
              givenname: 'developer',
              mail: 'developer@marmelab.com',
              o: 'CNRS',
              uid: 'tester.10',
          }
        : this.request.header;

    // si verif givenname n'est pas defini
    if (renaterHeader.displayname && !renaterHeader.givenname) {
        renaterHeader.sn = renaterHeader.displayname.split(' ')[0];
        renaterHeader.givenname = renaterHeader.displayname.split(' ')[1];
    }

    // si infos manquantes accès interdit
    if (
        !renaterHeader.uid ||
        !renaterHeader.givenname ||
        !renaterHeader.sn ||
        !renaterHeader.mail
    ) {
        return (this.status = 401);
    }
    const cookie =
        renaterHeader.cookie &&
        renaterHeader.cookie
            .split('; ')
            .filter((value) => value.match(/^_shibsession_/))[0];
    if (!cookie) {
        return (this.status = 401);
    }

    const similarAccounts = yield getSimilarAccount(
        renaterHeader.uid,
        renaterHeader.sn,
        renaterHeader.givenname,
    );
    const [code, name] = (renaterHeader.refscientificoffice || '').split('->');
    const institute = yield insertInstituteIfNotExists(code, name);

    if (renaterHeader.ou) {
        yield upsertOnePerCode({
            code: renaterHeader.ou,
        });
    }

    const unit = renaterHeader.ou
        ? yield selectOneByCode(renaterHeader.ou)
        : null;
    yield upsertOnePerUid({
        uid: renaterHeader.uid,
        name: decode(renaterHeader.sn),
        firstname: decode(renaterHeader.givenname),
        mail: decode(renaterHeader.mail),
        cnrs: renaterHeader.o === 'CNRS',
        last_connexion: renaterHeader['shib-authentication-instant'],
        primary_institute: institute && institute.id,
        primary_unit: unit && unit.id,
    });

    const user = yield selectOneByUid(renaterHeader.uid);

    if (similarAccounts.length) {
        const mail = this.getSimilarUidAlertMail(user, similarAccounts);
        yield this.sendMail(mail);
    }

    const domains = user.domains;
    const tokenData = {
        id: user.id,
        shib: cookie,
        username: `${user.firstname} ${user.name}`,
        domains,
        favorite_domain: user.favorite_domain || domains[0],
        origin: 'janus',
        exp: Math.ceil(Date.now() / 1000) + auth.expiresIn,
    };

    const cookieToken = jwt.sign(tokenData, auth.cookieSecret);

    const headerToken = jwt.sign(tokenData, auth.headerSecret);

    this.cookies.set('bibapi_token', cookieToken, { httpOnly: true });
    yield this.redis.setAsync(cookie, headerToken);
    this.redirect(decodeURIComponent(this.query.origin));
};

export const getLogin = function* () {
    const token = yield this.redis.getAsync(this.state.cookie.shib);
    if (!token) {
        this.status = 401;
        return;
    }

    let favouriteResources = yield getFavouriteResources(this.state.cookie.id);
    if (!favouriteResources) {
        favouriteResources = yield getRevuesByDomains([
            this.state.cookie.favorite_domain,
            ...this.state.cookie.domains,
        ]);
    }

    this.body = {
        id: this.state.cookie.id,
        username: this.state.cookie.username,
        domains: this.state.cookie.domains,
        favorite_domain: this.state.cookie.favorite_domain,
        favouriteResources,
        origin: this.state.cookie.origin || 'inist',
        token,
    };

    yield this.redis.delAsync(this.state.cookie.shib);
};

export const login = function* login() {
    const { username, password } = yield body(this);
    const inistAccount = yield authenticate(username, password);
    if (inistAccount) {
        const { id, domains, groups } = inistAccount;

        // update last_connexion at today
        yield updateLastConnexion(id);

        const tokenData = {
            id,
            username,
            domains,
            groups,
            origin: 'inist',
            exp: Math.ceil(Date.now() / 1000) + auth.expiresIn,
        };

        const cookieToken = jwt.sign(tokenData, auth.cookieSecret);
        const headerToken = jwt.sign(tokenData, auth.headerSecret);

        this.cookies.set('bibapi_token', cookieToken, {
            httpOnly: true,
        });

        this.body = {
            token: headerToken,
            domains,
            username,
        };

        return;
    }

    this.status = 401;
};
