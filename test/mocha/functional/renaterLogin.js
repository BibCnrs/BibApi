import jwt from 'koa-jwt';
import { auth } from 'config';

import { selectOneByUid as selectJanusAccountByUid } from '../../../lib/models/JanusAccount';
import Unit from '../../../lib/models/Unit';
import Institute from '../../../lib/models/Institute';

function* getJanusAccountIdFromUid(uid) {
    const { id } = yield postgres.queryOne({
        sql: 'SELECT id from janus_account WHERE uid=$uid',
        parameters: { uid },
    });
    return id;
}

describe('POST /ebsco/login_renater', function () {
    let janusAccountVie,
        janusAccountShs,
        janusAccountFavoriteDomain,
        janusAccount,
        institute,
        unitQueries,
        instituteQueries;

    before(function () {
        instituteQueries = Institute(postgres);
        unitQueries = Unit(postgres);
    });

    beforeEach(function* () {
        const [vie, shs, reaxys] = yield ['vie', 'shs', 'reaxys'].map((name) =>
            fixtureLoader.createCommunity({
                name,
                gate: name,
                ebsco: name !== 'reaxys',
            }),
        );

        institute = yield fixtureLoader.createInstitute({
            name: 'inshs',
            code: '54',
            communities: [shs.id, reaxys.id],
        });
        yield fixtureLoader.createUnit({
            code: 'UMR746',
            communities: [vie.id, reaxys.id],
        });

        janusAccountVie = yield fixtureLoader.createJanusAccount({
            uid: 'john',
            name: 'doe',
            firstname: 'john',
            mail: 'john@doe.com',
            communities: [vie.id, reaxys.id],
        });
        janusAccountShs = yield fixtureLoader.createJanusAccount({
            uid: 'jane',
            name: 'doe',
            firstname: 'jane',
            mail: 'jane@doe.com',
            communities: [shs.id, reaxys.id],
        });
        janusAccount = yield fixtureLoader.createJanusAccount({
            uid: 'johnny',
            name: 'doe',
            firstname: 'johnny',
            mail: 'johnny@doe.com',
            communities: [vie.id, shs.id, reaxys.id],
        });
        janusAccountFavoriteDomain = yield fixtureLoader.createJanusAccount({
            uid: 'luckyluke',
            name: 'lucky',
            firstname: 'luck',
            mail: 'lucky@luck.com',
            communities: [vie.id, shs.id],
            favorite_domain: 'shs',
        });

        apiServer.start();
    });

    it('should set bibapi_token cookie and save header token in redis corresponding to janusAccount with username equal to header uid(janusAccountVie)', function* () {
        const header = {
            uid: janusAccountVie.uid,
            sn: janusAccountVie.name,
            givenname: janusAccountVie.firstname,
            mail: janusAccountVie.mail,
            cookie: 'pll_language=fr; _shibsession_123=456',
        };
        const response = yield request.get(
            '/ebsco/login_renater?origin=http://bib.cnrs.fr',
            header,
        );

        const tokenData = {
            id: janusAccountVie.id,
            shib: '_shibsession_123=456',
            username: `${janusAccountVie.firstname} ${janusAccountVie.name}`,
            domains: ['vie', 'reaxys'],
            origin: 'janus',
            exp: Math.ceil(Date.now() / 1000) + auth.expiresIn,
            favorite_domain: 'vie',
        };
        const cookieToken = jwt.decode(
            response.headers['set-cookie'][0]
                .replace('bibapi_token=', '')
                .replace('; path=/; httponly', ''),
        );
        assert.deepEqual(cookieToken, {
            ...tokenData,
            iat: cookieToken.iat,
        });
        const redisToken = jwt.decode(
            yield redis.getAsync('_shibsession_123=456'),
        );
        assert.deepEqual(redisToken, {
            ...tokenData,
            iat: redisToken.iat,
        });

        assert.include(response.body, 'http://bib.cnrs.fr');
        assert.equal(response.statusCode, 302);
    });

    it('should set correct favorite domain if specified', function* () {
        const header = {
            uid: janusAccountFavoriteDomain.uid,
            sn: janusAccountFavoriteDomain.name,
            givenname: janusAccountFavoriteDomain.firstname,
            mail: janusAccountFavoriteDomain.mail,
            cookie: 'pll_language=fr; _shibsession_123=456',
        };
        const response = yield request.get(
            '/ebsco/login_renater?origin=http://bib.cnrs.fr',
            header,
        );

        const tokenData = {
            id: janusAccountFavoriteDomain.id,
            shib: '_shibsession_123=456',
            username: `${janusAccountFavoriteDomain.firstname} ${janusAccountFavoriteDomain.name}`,
            domains: ['vie', 'shs'],
            origin: 'janus',
            exp: Math.ceil(Date.now() / 1000) + auth.expiresIn,
            favorite_domain: 'shs',
        };
        const cookieToken = jwt.decode(
            response.headers['set-cookie'][0]
                .replace('bibapi_token=', '')
                .replace('; path=/; httponly', ''),
        );
        assert.deepEqual(cookieToken, {
            ...tokenData,
            iat: cookieToken.iat,
        });
        const redisToken = jwt.decode(
            yield redis.getAsync('_shibsession_123=456'),
        );
        assert.deepEqual(redisToken, {
            ...tokenData,
            iat: redisToken.iat,
        });

        assert.include(response.body, 'http://bib.cnrs.fr');
        assert.equal(response.statusCode, 302);
    });

    it('should set bibapi_token cookie and save header token in redis corresponding to user with username equal to header uid(janusAccountShs)', function* () {
        const header = {
            uid: janusAccountShs.uid,
            sn: janusAccountShs.name,
            givenname: janusAccountShs.firstname,
            mail: janusAccountShs.mail,
            cookie: 'pll_language=fr; _shibsession_123=456',
        };
        const response = yield request.get(
            '/ebsco/login_renater?origin=http://bib.cnrs.fr',
            header,
        );

        const tokenData = {
            id: janusAccountShs.id,
            shib: '_shibsession_123=456',
            username: `${janusAccountShs.firstname} ${janusAccountShs.name}`,
            domains: ['shs', 'reaxys'],
            origin: 'janus',
            exp: Math.ceil(Date.now() / 1000) + auth.expiresIn,
            favorite_domain: 'shs',
        };

        const cookieToken = jwt.decode(
            response.headers['set-cookie'][0]
                .replace('bibapi_token=', '')
                .replace('; path=/; httponly', ''),
        );
        assert.deepEqual(cookieToken, {
            ...tokenData,
            iat: cookieToken.iat,
        });

        const redisToken = jwt.decode(
            yield redis.getAsync('_shibsession_123=456'),
        );
        assert.deepEqual(redisToken, {
            ...tokenData,
            iat: redisToken.iat,
        });

        assert.equal(response.statusCode, 302);
        assert.include(response.body, 'http://bib.cnrs.fr');
    });

    it('should set bibapi_token cookie and save headerToken in redis corresponding to user with username equal to header uid(user)', function* () {
        const header = {
            uid: janusAccount.uid,
            sn: janusAccount.name,
            givenname: janusAccount.firstname,
            mail: janusAccount.mail,
            cookie: 'pll_language=fr; _shibsession_123=456',
        };
        const response = yield request.get(
            '/ebsco/login_renater?origin=http://bib.cnrs.fr',
            header,
        );

        const tokenData = {
            id: janusAccount.id,
            shib: '_shibsession_123=456',
            username: `${janusAccount.firstname} ${janusAccount.name}`,
            domains: ['vie', 'shs', 'reaxys'],
            origin: 'janus',
            exp: Math.ceil(Date.now() / 1000) + auth.expiresIn,
            favorite_domain: 'vie',
        };

        const cookieToken = jwt.decode(
            response.headers['set-cookie'][0]
                .replace('bibapi_token=', '')
                .replace('; path=/; httponly', ''),
        );
        assert.deepEqual(cookieToken, {
            ...tokenData,
            iat: cookieToken.iat,
        });

        const redisToken = jwt.decode(
            yield redis.getAsync('_shibsession_123=456'),
        );
        assert.deepEqual(redisToken, {
            ...tokenData,
            iat: redisToken.iat,
        });

        assert.equal(response.statusCode, 302);
        assert.include(response.body, 'http://bib.cnrs.fr');
    });

    it('should return cookie token with session for shs if called with header.refscientificoffice 54 and no user correspond to uid and create corresponding user', function* () {
        const header = {
            uid: 'will',
            givenname: 'will',
            sn: 'doe',
            mail: 'will@doe.com',
            refscientificoffice:
                '54->Institut des sciences humaines et sociales',
            cookie: 'pll_language=fr; _shibsession_123=456',
        };
        const domains = ['shs', 'reaxys'];
        const response = yield request.get(
            '/ebsco/login_renater?origin=http://bib.cnrs.fr',
            header,
        );

        const id = yield getJanusAccountIdFromUid('will');
        const tokenData = {
            id,
            shib: '_shibsession_123=456',
            username: 'will doe',
            domains,
            origin: 'janus',
            exp: Math.ceil(Date.now() / 1000) + auth.expiresIn,
            favorite_domain: 'shs',
        };

        const cookieToken = jwt.decode(
            response.headers['set-cookie'][0]
                .replace('bibapi_token=', '')
                .replace('; path=/; httponly', ''),
        );
        assert.deepEqual(cookieToken, {
            ...tokenData,
            iat: cookieToken.iat,
        });

        const redisToken = jwt.decode(
            yield redis.getAsync('_shibsession_123=456'),
        );
        assert.deepEqual(redisToken, {
            ...tokenData,
            iat: redisToken.iat,
        });

        assert.equal(response.statusCode, 302);
        assert.include(response.body, 'http://bib.cnrs.fr');
        const will = yield selectJanusAccountByUid('will');
        assert.equal(will.uid, 'will');
        assert.equal(will.primary_institute, institute.id);
        assert.deepEqual(will.domains, domains);
        assert.deepEqual(will.groups, ['shs', 'reaxys']);
        assert.deepEqual(will.additional_institutes, []);
        assert.deepEqual(will.additional_units, []);
        assert.equal(will.primary_unit, null);
    });

    it('should return authorization token with session for vie if called with header.ou UMR746 and no user correspond to uid creating corresponding user', function* () {
        const header = {
            uid: 'will',
            sn: 'doe',
            givenname: 'will',
            mail: 'will@doe.com',
            'shib-authentication-instant': '2016-02-09T13:14:13.454Z',
            o: 'CNRS',
            ou: 'UMR746',
            cookie: 'pll_language=fr; _shibsession_123=456',
        };
        const domains = ['vie', 'reaxys'];
        const response = yield request.get(
            '/ebsco/login_renater?origin=http://bib.cnrs.fr',
            header,
        );

        const id = yield getJanusAccountIdFromUid('will');
        const tokenData = {
            id,
            shib: '_shibsession_123=456',
            username: 'will doe',
            domains,
            origin: 'janus',
            exp: Math.ceil(Date.now() / 1000) + auth.expiresIn,
            favorite_domain: 'vie',
        };

        const cookieToken = jwt.decode(
            response.headers['set-cookie'][0]
                .replace('bibapi_token=', '')
                .replace('; path=/; httponly', ''),
        );
        assert.deepEqual(cookieToken, {
            ...tokenData,
            iat: cookieToken.iat,
        });

        const redisToken = jwt.decode(
            yield redis.getAsync('_shibsession_123=456'),
        );
        assert.deepEqual(redisToken, {
            ...tokenData,
            iat: redisToken.iat,
        });

        assert.equal(response.statusCode, 302);
        assert.include(response.body, 'http://bib.cnrs.fr');
        const will = yield selectJanusAccountByUid('will');
        assert.equal(will.uid, 'will');
        assert.equal(will.name, 'doe');
        assert.equal(will.firstname, 'will');
        assert.equal(will.mail, 'will@doe.com');
        assert.isTrue(will.cnrs);
        assert.deepEqual(
            will.last_connexion,
            new Date('2016-02-09T00:00:00.000Z'),
        );
        assert.equal(will.primary_institute, null);
        assert.deepEqual(will.domains, domains);
        assert.deepEqual(will.groups, ['vie', 'reaxys']);
        const primaryUnit = yield unitQueries.selectOneByCode('UMR746');
        assert.equal(will.primary_unit, primaryUnit.id);
        assert.deepEqual(will.additional_institutes, []);
        assert.deepEqual(will.additional_units, []);
    });

    it('should create received refscientificoffice as institue if it does not exists and assign it to the janusAccount', function* () {
        const header = {
            uid: janusAccount.uid,
            sn: janusAccount.name,
            givenname: janusAccount.firstname,
            mail: janusAccount.mail,
            refscientificoffice: '66->Marmelab',
            cookie: 'pll_language=fr; _shibsession_123=456',
        };
        const response = yield request.get(
            '/ebsco/login_renater?origin=http://bib.cnrs.fr',
            header,
        );
        const domains = ['vie', 'shs', 'reaxys'];

        const tokenData = {
            id: janusAccount.id,
            shib: '_shibsession_123=456',
            username: `${janusAccount.firstname} ${janusAccount.name}`,
            domains,
            origin: 'janus',
            exp: Math.ceil(Date.now() / 1000) + auth.expiresIn,
            favorite_domain: 'vie',
        };
        assert.equal(response.statusCode, 302);

        const cookieToken = jwt.decode(
            response.headers['set-cookie'][0]
                .replace('bibapi_token=', '')
                .replace('; path=/; httponly', ''),
        );
        assert.deepEqual(cookieToken, {
            ...tokenData,
            iat: cookieToken.iat,
        });

        const redisToken = jwt.decode(
            yield redis.getAsync('_shibsession_123=456'),
        );
        assert.deepEqual(redisToken, {
            ...tokenData,
            iat: redisToken.iat,
        });

        const newInstitute = yield instituteQueries.selectOneByCode({
            code: '66',
        });
        assert.equal(newInstitute.code, '66');
        assert.equal(newInstitute.name, 'Marmelab');
        assert.deepEqual(newInstitute.communities, []);

        const updatedUser = yield selectJanusAccountByUid({
            uid: janusAccount.uid,
        });
        assert.equal(updatedUser.primary_institute, newInstitute.id);
    });

    it('should create received header.ou as unit if it does not exists and assign it to the janusAccount', function* () {
        const header = {
            uid: janusAccount.uid,
            sn: janusAccount.name,
            givenname: janusAccount.firstname,
            mail: janusAccount.mail,
            ou: 'Marmelab Unit',
            cookie: 'pll_language=fr; _shibsession_123=456',
        };

        const response = yield request.get(
            '/ebsco/login_renater?origin=http://bib.cnrs.fr',
            header,
        );

        const domains = ['vie', 'shs', 'reaxys'];

        const tokenData = {
            id: janusAccount.id,
            shib: '_shibsession_123=456',
            username: `${janusAccount.firstname} ${janusAccount.name}`,
            domains,
            origin: 'janus',
            exp: Math.ceil(Date.now() / 1000) + auth.expiresIn,
            favorite_domain: 'vie',
        };

        const cookieToken = jwt.decode(
            response.headers['set-cookie'][0]
                .replace('bibapi_token=', '')
                .replace('; path=/; httponly', ''),
        );
        assert.deepEqual(cookieToken, {
            ...tokenData,
            iat: cookieToken.iat,
        });

        const redisToken = jwt.decode(
            yield redis.getAsync('_shibsession_123=456'),
        );
        assert.deepEqual(redisToken, {
            ...tokenData,
            iat: redisToken.iat,
        });

        assert.equal(response.statusCode, 302);
        const newUnit = yield unitQueries.selectOneByCode({
            code: 'Marmelab Unit',
        });
        assert.equal(newUnit.code, 'Marmelab Unit');
        assert.deepEqual(newUnit.communities, []);

        const updatedUser = yield selectJanusAccountByUid({
            uid: janusAccount.uid,
        });
        assert.equal(updatedUser.primary_unit, newUnit.id);
    });

    it('should update janusAccount.primary_institute if called with different refscientificoffice', function* () {
        const header = {
            uid: janusAccount.uid,
            sn: janusAccount.name,
            givenname: janusAccount.firstname,
            mail: janusAccount.mail,
            refscientificoffice:
                '54->Institut des sciences humaines et sociales',
            cookie: 'pll_language=fr; _shibsession_123=456',
        };
        const response = yield request.get(
            '/ebsco/login_renater?origin=http://bib.cnrs.fr',
            header,
        );

        const tokenData = {
            id: janusAccount.id,
            shib: '_shibsession_123=456',
            username: `${janusAccount.firstname} ${janusAccount.name}`,
            domains: ['shs', 'reaxys', 'vie'],
            origin: 'janus',
            exp: Math.ceil(Date.now() / 1000) + auth.expiresIn,
            favorite_domain: 'shs',
        };
        assert.equal(response.statusCode, 302);
        assert.include(response.body, 'http://bib.cnrs.fr');

        const cookieToken = jwt.decode(
            response.headers['set-cookie'][0]
                .replace('bibapi_token=', '')
                .replace('; path=/; httponly', ''),
        );
        assert.deepEqual(cookieToken, {
            ...tokenData,
            iat: cookieToken.iat,
        });

        const redisToken = jwt.decode(
            yield redis.getAsync('_shibsession_123=456'),
        );
        assert.deepEqual(redisToken, {
            ...tokenData,
            iat: redisToken.iat,
        });

        const updatedUser = yield selectJanusAccountByUid({
            uid: janusAccount.uid,
        });
        assert.equal(updatedUser.uid, janusAccount.uid);
        assert.equal(updatedUser.primary_institute, institute.id);
        assert.deepEqual(updatedUser.domains, ['shs', 'reaxys', 'vie']);
        assert.deepEqual(updatedUser.groups, ['shs', 'reaxys', 'vie']);
        assert.equal(updatedUser.primary_unit, null);
        assert.equal(updatedUser.password, null);
    });

    it('should redirect with no domain if user does not exists and has no institute nor unit', function* () {
        const header = {
            uid: 'will',
            givenname: 'will',
            sn: 'doe',
            mail: 'will@doe.com',
            cookie: 'pll_language=fr; _shibsession_123=456',
        };

        const response = yield request.get(
            '/ebsco/login_renater?origin=http://bib.cnrs.fr',
            header,
        );

        const id = yield getJanusAccountIdFromUid('will');
        const tokenData = {
            id,
            shib: '_shibsession_123=456',
            username: 'will doe',
            domains: [],
            origin: 'janus',
            exp: Math.ceil(Date.now() / 1000) + auth.expiresIn,
        };

        const cookieToken = jwt.decode(
            response.headers['set-cookie'][0]
                .replace('bibapi_token=', '')
                .replace('; path=/; httponly', ''),
        );
        assert.deepEqual(cookieToken, {
            ...tokenData,
            iat: cookieToken.iat,
        });

        const redisToken = jwt.decode(
            yield redis.getAsync('_shibsession_123=456'),
        );
        assert.deepEqual(redisToken, {
            ...tokenData,
            iat: redisToken.iat,
        });

        assert.equal(response.statusCode, 302);
        assert.include(response.body, 'http://bib.cnrs.fr');
    });

    it('should return 401 if no _shibsession_%d cookie header is present', function* () {
        const header = {
            uid: janusAccount.uid,
            cookie: 'pll_language=fr; 123=456',
        };
        const response = yield request.get(
            '/ebsco/login_renater?origin=http://bib.cnrs.fr',
            header,
        );
        assert.equal(response.statusCode, 401);
    });

    it('should return 401 if header does not contains an uid', function* () {
        const header = {
            givenname: 'will',
            sn: 'doe',
            mail: 'will@doe.com',
            cookie: 'pll_language=fr; _shibsession_123=456',
        };
        const response = yield request.get(
            '/ebsco/login_renater?origin=http://bib.cnrs.fr',
            header,
        );
        assert.equal(response.statusCode, 401);
    });

    it('should return 401 if header does not contains a givenname', function* () {
        const header = {
            uid: 'will',
            sn: 'doe',
            mail: 'will@doe.com',
            cookie: 'pll_language=fr; _shibsession_123=456',
        };
        const response = yield request.get(
            '/ebsco/login_renater?origin=http://bib.cnrs.fr',
            header,
        );
        assert.equal(response.statusCode, 401);
    });

    it('should return 401 if header does not contains a sn', function* () {
        const header = {
            uid: 'will',
            givenname: 'will',
            mail: 'will@doe.com',
            cookie: 'pll_language=fr; _shibsession_123=456',
        };
        const response = yield request.get(
            '/ebsco/login_renater?origin=http://bib.cnrs.fr',
            header,
        );
        assert.equal(response.statusCode, 401);
    });

    it('should return 401 if header does not contains a mail', function* () {
        const header = {
            uid: 'will',
            givenname: 'will',
            sn: 'doe',
            cookie: 'pll_language=fr; _shibsession_123=456',
        };
        const response = yield request.get(
            '/ebsco/login_renater?origin=http://bib.cnrs.fr',
            header,
        );
        assert.equal(response.statusCode, 401);
    });

    it('should send alert mail', function* () {
        const header = {
            uid: `${janusAccount.uid}.1`,
            sn: janusAccount.name,
            givenname: janusAccount.firstname,
            mail: janusAccount.mail,
            refscientificoffice: '66->Marmelab',
            ou: 'UMR746',
            cookie: 'pll_language=fr; _shibsession_123=456',
        };
        yield request.get(
            '/ebsco/login_renater?origin=http://bib.cnrs.fr',
            header,
        );

        const id = yield getJanusAccountIdFromUid(header.uid);

        const mails = yield mailServer.getAllMails();
        assert.deepEqual(mails, [
            {
                from: [
                    {
                        address: 'bibcnrs@bib.cnrs.fr',
                        name: '',
                    },
                ],
                to: [
                    {
                        address: 'assistance-portail@inist.fr',
                        name: '',
                    },
                ],
                subject: 'Alerte : Nouveau uid johnny.1 similaire',
                text: `Le nouveau compte johnny.1 : https://bibadmin_url/#/janusAccounts/edit/${id} ressemble aux comptes suivants :
Liste https://bibadmin_url/#/janusAccounts/list?search=%7B%22like_janus_account.uid%22:%22johnny%22%7D :
- johnny : https://bibadmin_url/#/janusAccounts/edit/${janusAccount.id}`,
                html: `<p>Le nouveau compte <a href="https://bibadmin_url/#/janusAccounts/edit/${id}">johnny.1</a> ressemble aux comptes suivants : </p>
<a href="https://bibadmin_url/#/janusAccounts/list?search=%7B%22like_janus_account.uid%22:%22johnny%22%7D">Liste :</a>
<ul>
    <li><a href="https://bibadmin_url/#/janusAccounts/edit/${janusAccount.id}">johnny</a></li>
</ul>`,
            },
        ]);
    });

    it('should not send alert mail if account already exists', function* () {
        yield fixtureLoader.createJanusAccount({
            uid: 'johnny.1',
            name: 'doe',
            firstname: 'johnny',
            mail: 'johnny@doe.com',
            communities: [],
        });
        const header = {
            uid: `${janusAccount.uid}.1`,
            sn: janusAccount.name,
            givenname: janusAccount.firstname,
            mail: janusAccount.mail,
            refscientificoffice: '66->Marmelab',
            ou: 'UMR746',
            cookie: 'pll_language=fr; _shibsession_123=456',
        };
        yield request.get(
            '/ebsco/login_renater?origin=http://bib.cnrs.fr',
            header,
        );
        const mails = yield mailServer.getAllMails();
        assert.deepEqual(mails, []);
    });

    it('should not send alert mail if uid is totally new', function* () {
        const header = {
            uid: `new.1`,
            sn: janusAccount.name,
            givenname: janusAccount.firstname,
            mail: janusAccount.mail,
            refscientificoffice: '66->Marmelab',
            ou: 'UMR746',
            cookie: 'pll_language=fr; _shibsession_123=456',
        };
        yield request.get(
            '/ebsco/login_renater?origin=http://bib.cnrs.fr',
            header,
        );
        const mails = yield mailServer.getAllMails();
        assert.deepEqual(mails, []);
    });

    afterEach(function* () {
        yield fixtureLoader.clear();
        request.setToken();
        apiServer.close();
        yield mailServer.clearMails();
    });
});
