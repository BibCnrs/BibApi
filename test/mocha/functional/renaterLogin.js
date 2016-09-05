import jwt from 'koa-jwt';
import { auth } from 'config';

import JanusAccount from '../../../lib/models/JanusAccount';
import Unit from '../../../lib/models/Unit';
import Institute from '../../../lib/models/Institute';
import RenaterHeader from '../../../lib/models/RenaterHeader';

function* getJanusAccountIdFromUid(uid) {
    const { id } = yield postgres.queryOne({ sql: 'SELECT id from janus_account WHERE uid=$uid', parameters: { uid }});
    return id;
}

describe('POST /ebsco/login_renater', function () {
    let janusAccountVie, janusAccountShs, janusAccount, institute, unit, janusAccountQueries, unitQueries, instituteQueries;

    before(function () {
        janusAccountQueries = JanusAccount(postgres);
        instituteQueries = Institute(postgres);
        unitQueries = Unit(postgres);
    });

    beforeEach(function* () {
        yield ['vie', 'shs']
        .map(name => fixtureLoader.createDomain({ name }));

        institute = yield fixtureLoader.createInstitute({ name: 'inshs', code: '54', domains: ['shs'] });
        unit = yield fixtureLoader.createUnit({ code: 'UMR746', domains: ['vie'] });

        janusAccountVie = yield fixtureLoader.createJanusAccount({
            uid: 'john',
            name: 'doe',
            firstname: 'john',
            mail: 'john@doe.com',
            domains: ['vie']
        });
        janusAccountShs = yield fixtureLoader.createJanusAccount({
            uid: 'jane',
            name: 'doe',
            firstname: 'jane',
            mail: 'jane@doe.com',
            domains: ['shs']
        });
        janusAccount = yield fixtureLoader.createJanusAccount({
            uid: 'johnny',
            name: 'doe',
            firstname: 'johnny',
            mail: 'johnny@doe.com',
            domains: ['vie', 'shs']
        });

        apiServer.start();
    });

    it('should set bibapi_token cookie and save header token in redis corresponding to janusAccount with username equal to header uid(janusAccountVie)', function* () {
        const header = {
            uid: janusAccountVie.uid,
            sn: janusAccountVie.name,
            givenname: janusAccountVie.firstname,
            cookie: 'pll_language=fr; _shibsession_123=456'
        };
        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', header);

        const tokenData = {
            id: janusAccountVie.id,
            shib: '_shibsession_123=456',
            username: `${janusAccountVie.firstname} ${janusAccountVie.name}`,
            domains: ['vie'],
            origin: 'janus'
        };

        assert.deepEqual(
            jwt.decode(response.headers['set-cookie'][0].replace('bibapi_token=', '').replace('; path=/; httponly', ''), { complete: true }),
            jwt.decode(jwt.sign(tokenData, auth.cookieSecret), { complete: true })
        );

        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign(tokenData, auth.cookieSecret)}; path=/; httponly`
        ]);

        assert.deepEqual(
            yield redis.getAsync('_shibsession_123=456'),
            jwt.sign(tokenData, auth.headerSecret)
        );

        assert.include(response.body, 'http://bib.cnrs.fr');
        assert.equal(response.statusCode, 302);
    });

    it('should set bibapi_token cookie and save header token in redis corresponding to user with username equal to header uid(janusAccountShs)', function* () {
        const header = {
            uid: janusAccountShs.uid,
            sn: janusAccountShs.name,
            givenname: janusAccountShs.firstname,
            cookie: 'pll_language=fr; _shibsession_123=456'
        };
        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', header);
        const domains = janusAccountShs.domains.map(d => d.name);

        const tokenData = {
            id: janusAccountShs.id,
            shib: '_shibsession_123=456',
            username: `${janusAccountShs.firstname} ${janusAccountShs.name}`,
            domains,
            origin: 'janus'
        };

        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign(tokenData, auth.cookieSecret)}; path=/; httponly`
        ]);

        assert.deepEqual(
            yield redis.getAsync('_shibsession_123=456'),
            jwt.sign(tokenData, auth.headerSecret)
        );

        assert.equal(response.statusCode, 302);
        assert.include(response.body, 'http://bib.cnrs.fr');
    });

    it('should set bibapi_token cookie and save headerToken in redis corresponding to user with username equal to header uid(user)', function* () {
        const header = {
            uid: janusAccount.uid,
            sn: janusAccount.name,
            givenname: janusAccount.firstname,
            cookie: 'pll_language=fr; _shibsession_123=456'
        };
        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', header);
        const domains = janusAccount.domains.map(d => d.name);

        const tokenData = {
            id: janusAccount.id,
            shib: '_shibsession_123=456',
            username: `${janusAccount.firstname} ${janusAccount.name}`,
            domains,
            origin: 'janus'
        };

        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign(tokenData, auth.cookieSecret)}; path=/; httponly`
        ]);

        assert.deepEqual(
            yield redis.getAsync('_shibsession_123=456'),
            jwt.sign(tokenData, auth.headerSecret)
        );

        assert.equal(response.statusCode, 302);
        assert.include(response.body, 'http://bib.cnrs.fr');
    });

    it('should return cookie token with session for shs if called with header.refscientificoffice 54 and no user correspond to uid and create corresponding user', function* () {
        const header = {
            uid: 'will',
            givenname: 'will',
            sn: 'doe',
            refscientificoffice: '54->Institut des sciences humaines et sociales',
            cookie: 'pll_language=fr; _shibsession_123=456'
        };
        const domains = institute.domains.map(d => d.name);
        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', header);

        const id = yield getJanusAccountIdFromUid('will');
        const tokenData = {
            id,
            shib: '_shibsession_123=456',
            username: 'will doe',
            domains,
            origin: 'janus'
        };

        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign(tokenData, auth.cookieSecret)}; path=/; httponly`
        ]);
        assert.equal(response.statusCode, 302);
        assert.include(response.body, 'http://bib.cnrs.fr');
        const will = yield janusAccountQueries.selectOneByUid('will');
        assert.equal(will.uid, 'will');
        assert.equal(will.primary_institute, institute.id);
        assert.deepEqual(will.domains, []);
        assert.deepEqual(will.additional_institutes, []);
        assert.deepEqual(will.additional_units, []);
        assert.equal(will.primary_unit, null);
    });

    it('should return authorization token with session for shs if called with header.ou UMR746 and no user correspond to uid creating corresponding user', function* () {
        const header = {
            uid: 'will',
            sn: 'doe',
            givenname: 'will',
            mail: 'will@doe.com',
            'shib-authentication-instant': '2016-02-09T13:14:13.454Z',
            o: 'CNRS',
            ou: 'UMR746',
            cookie: 'pll_language=fr; _shibsession_123=456'
        };
        const domains = unit.domains.map(d => d.name);
        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', header);

        const id = yield getJanusAccountIdFromUid('will');
        const tokenData = {
            id,
            shib: '_shibsession_123=456',
            username: 'will doe',
            domains,
            origin: 'janus'
        };

        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign(tokenData, auth.cookieSecret)}; path=/; httponly`
        ]);
        assert.equal(response.statusCode, 302);
        assert.include(response.body, 'http://bib.cnrs.fr');
        const will = yield janusAccountQueries.selectOneByUid('will');
        assert.equal(will.uid, 'will');
        assert.equal(will.name, 'doe');
        assert.equal(will.firstname, 'will');
        assert.equal(will.mail, 'will@doe.com');
        assert.isTrue(will.cnrs);
        assert.deepEqual(will.last_connexion, new Date('2016-02-09T00:00:00.000Z'));
        assert.equal(will.primary_institute, null);
        assert.deepEqual(will.domains, []);
        const primaryUnit = yield unitQueries.selectOneByCode('UMR746');
        assert.equal(will.primary_unit, primaryUnit.id);
        assert.deepEqual(will.additional_institutes, []);
        assert.deepEqual(will.additional_units, []);
    });

    it('should create received refscientificoffice as institue if it does not exists and assign it to the janusAccount', function* () {
        const header = {
            uid: janusAccount.uid,
            refscientificoffice: '66->Marmelab',
            cookie: 'pll_language=fr; _shibsession_123=456'
        };
        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', header);
        const domains = janusAccount.domains.map(d => d.name);

        const tokenData = {
            id: janusAccount.id,
            shib: '_shibsession_123=456',
            username: `${janusAccount.firstname} ${janusAccount.name}`,
            domains,
            origin: 'janus'
        };

        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign(tokenData, auth.cookieSecret)}; path=/; httponly`
        ]);
        assert.equal(response.statusCode, 302);
        const newInstitute = yield instituteQueries.selectOneByCode({ code: '66' });
        assert.equal(newInstitute.code, '66');
        assert.equal(newInstitute.name, 'Marmelab');
        assert.deepEqual(newInstitute.domains, []);

        const updatedUser = yield janusAccountQueries.selectOneByUid({ uid: janusAccount.uid });
        assert.equal(updatedUser.primary_institute, newInstitute.id);
    });

    it('should create received header.ou as unit if it does not exists and assign it to the janusAccount', function* () {
        const header = {
            uid: janusAccount.uid,
            ou: 'Marmelab Unit',
            cookie: 'pll_language=fr; _shibsession_123=456'
        };

        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', header);

        const domains = janusAccount.domains.map(d => d.name);

        const tokenData = {
            id: janusAccount.id,
            shib: '_shibsession_123=456',
            username: `${janusAccount.firstname} ${janusAccount.name}`,
            domains,
            origin: 'janus'
        };

        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign(tokenData, auth.cookieSecret)}; path=/; httponly`
        ]);
        assert.equal(response.statusCode, 302);
        const newUnit = yield unitQueries.selectOneByCode({ code: 'Marmelab Unit' });
        assert.equal(newUnit.code, 'Marmelab Unit');
        assert.deepEqual(newUnit.domains, []);

        const updatedUser = yield janusAccountQueries.selectOneByUid({ uid: janusAccount.uid });
        assert.equal(updatedUser.primary_unit, newUnit.id);
    });

    it('should update janusAccount.primary_institute if called with different refscientificoffice', function* () {
        const header = {
            uid: janusAccount.uid,
            refscientificoffice: '54->Institut des sciences humaines et sociales',
            cookie: 'pll_language=fr; _shibsession_123=456'
        };
        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', header);

        const tokenData = {
            id: janusAccount.id,
            shib: '_shibsession_123=456',
            username: `${janusAccount.firstname} ${janusAccount.name}`,
            domains: ['shs', 'vie'],
            origin: 'janus'
        };

        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign(tokenData, auth.cookieSecret)}; path=/; httponly`
        ]);
        assert.equal(response.statusCode, 302);
        assert.include(response.body, 'http://bib.cnrs.fr');
        const updatedUser = yield janusAccountQueries.selectOneByUid({ uid: janusAccount.uid });
        assert.equal(updatedUser.uid, janusAccount.uid);
        assert.equal(updatedUser.primary_institute, institute.id);
        assert.deepEqual(updatedUser.domains, ['vie', 'shs']);
        assert.equal(updatedUser.primary_unit, null);
        assert.equal(updatedUser.password, null);
    });

    it('should redirect with no domain if user does not exists and has no institute nor unit', function* () {
        const header = {
            uid: 'will',
            givenname: 'will',
            sn: 'doe',
            cookie: 'pll_language=fr; _shibsession_123=456'
        };

        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', header);

        const id = yield getJanusAccountIdFromUid('will');
        const tokenData = {
            id,
            shib: '_shibsession_123=456',
            username: 'will doe',
            domains: [],
            origin: 'janus'
        };

        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign(tokenData, auth.cookieSecret)}; path=/; httponly`
        ]);
        assert.equal(response.statusCode, 302);
        assert.include(response.body, 'http://bib.cnrs.fr');
    });

    it('should return 401  if no _shibsession_%d cookie header is present', function* () {
        const header = {
            uid: janusAccount.uid,
            cookie: 'pll_language=fr; 123=456'
        };
        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', header);
        assert.equal(response.statusCode, 401);
    });

    it('should save all received header as a new renaterHeader', function* () {
        const headers = {
            cookie: 'pll_language=fr; _shibsession_123=456',
            cn: 'doe',
            uid: 'john',
            mail: 'john@doe.fr',
            what: 'ever'
        };
        const response = yield request.get('/ebsco/login_renater', headers);
        assert.equal(response.statusCode, 302);
        const renaterHeaders = yield RenaterHeader.find();

        assert.equal(renaterHeaders.length, 1);

        const renaterHeader = renaterHeaders[0].toJSON();

        assert.equal(renaterHeader.cn, headers.cn);
        assert.equal(renaterHeader.uid, headers.uid);
        assert.equal(renaterHeader.mail, headers.mail);
        assert.equal(renaterHeader.what, headers.what);
    });

    afterEach(function* () {
        yield fixtureLoader.clear();
        request.setToken();
        apiServer.close();
    });
});
