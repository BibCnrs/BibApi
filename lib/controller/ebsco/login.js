import config, { auth } from 'config';
import jwt from 'koa-jwt';
import body from 'co-body';
import iconv from 'iconv-lite';

function* handleInstitute(code, name, instituteQueries) {
    if (!code) {
        return null;
    }
    let institute = yield instituteQueries.selectOneByCode({ code });
    if (institute) {
        return institute;
    }

    return yield instituteQueries.insertOne({ code, name });
}

const decode = value => {
    if (!value) {
        return undefined;
    }

    return iconv.decode(new Buffer(value, 'binary'), 'utf-8');
};

function* getSimilarUid(uid) {
    if (yield this.janusAccountQueries.selectOneByUid(uid)) {
        return []; // not a new user so no check
    }

    const [, id] = uid.match(/^(.*?)\.[0-9]+$/) || [null, uid];

    return yield this.janusAccountQueries.selectBySimilarUid(id);
}

export const renaterLogin = function* login() {
    const renaterHeader = config.fakeLogin
        ? {
              cookie: '_shibsession_id=_sessionid',
              sn: 'marmelab',
              givenname: 'developer',
              mail: 'developer@marmelab.com',
              o: 'CNRS',
              uid: 'tester.5',
          }
        : this.request.header;

    const similarAccounts = yield getSimilarUid.bind(this)(renaterHeader.uid);

    if (similarAccounts.length) {
        // TODO send mail
    }

    const cookie =
        renaterHeader.cookie &&
        renaterHeader.cookie
            .split('; ')
            .filter(value => value.match(/^_shibsession_/))[0];
    if (!cookie) {
        return (this.status = 401);
    }
    const [code, name] = (renaterHeader.refscientificoffice || '').split('->');
    const institute = yield handleInstitute(code, name, this.instituteQueries);

    if (renaterHeader.ou) {
        yield this.unitQueries.upsertOnePerCode({ code: renaterHeader.ou });
    }
    const unit = renaterHeader.ou
        ? yield this.unitQueries.selectOneByCode({ code: renaterHeader.ou })
        : null;

    if (
        !renaterHeader.uid ||
        !renaterHeader.sn ||
        !renaterHeader.givenname ||
        !renaterHeader.mail
    ) {
        return (this.status = 401);
    }

    yield this.janusAccountQueries.upsertOnePerUid({
        uid: renaterHeader.uid,
        name: decode(renaterHeader.sn),
        firstname: decode(renaterHeader.givenname),
        mail: decode(renaterHeader.mail),
        cnrs: renaterHeader.o === 'CNRS',
        last_connexion: renaterHeader['shib-authentication-instant'],
        primary_institute: institute && institute.id,
        primary_unit: unit && unit.id,
    });

    const user = yield this.janusAccountQueries.selectOneByUid(
        renaterHeader.uid,
    );

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

export const getLogin = function*() {
    const token = yield this.redis.getAsync(this.state.cookie.shib);
    if (!token) {
        this.status = 401;
        return;
    }
    this.body = {
        username: this.state.cookie.username,
        domains: this.state.cookie.domains,
        favorite_domain: this.state.cookie.favorite_domain,
        origin: this.state.cookie.origin || 'inist',
        token,
    };

    yield this.redis.delAsync(this.state.cookie.shib);
};

export const login = function* login() {
    const { username, password } = yield body(this);
    const inistAccount = yield this.inistAccountQueries.authenticate(
        username,
        password,
    );

    if (inistAccount) {
        const { id, domains, groups } = inistAccount;

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

        this.cookies.set('bibapi_token', cookieToken, { httpOnly: true });

        this.body = {
            token: headerToken,
            domains,
            username,
        };

        return;
    }

    this.status = 401;
};
