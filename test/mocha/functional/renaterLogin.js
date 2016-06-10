import jwt from 'koa-jwt';
import { auth } from 'config';

import JanusAccount from '../../../lib/models/JanusAccount';
import Unit from '../../../lib/models/Unit';
import Institute from '../../../lib/models/Institute';
import RenaterHeader from '../../../lib/models/RenaterHeader';

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

        janusAccountVie = yield fixtureLoader.createJanusAccount({ username: 'john', domains: ['vie'] });
        janusAccountShs = yield fixtureLoader.createJanusAccount({ username: 'jane', domains: ['shs'] });
        janusAccount = yield fixtureLoader.createJanusAccount({ username: 'johnny', domains: ['vie', 'shs'] });

        apiServer.start();
    });

    it('should set bibapi_token cookie and save header token in redis corresponding to janusAccount with username equal to header remote_user(janusAccountVie)', function* () {
        const header = {
            remote_user: janusAccountVie.username,
            cookie: 'pll_language=fr; _shibsession_123=456'
        };
        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', header);

        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign({ shib: '_shibsession_123=456', username: janusAccountVie.username, domains: ['vie'] }, auth.cookieSecret)}; path=/; httponly`
        ]);

        assert.deepEqual(yield redis.getAsync('_shibsession_123=456'), jwt.sign({ shib: '_shibsession_123=456', username: janusAccountVie.username, domains: ['vie'] }, auth.headerSecret));

        assert.include(response.body, `http://bib.cnrs.fr`);
        assert.equal(response.statusCode, 302);
    });

    it('should set bibapi_token cookie and save header token in redis corresponding to user with username equal to header remote_user(janusAccountShs)', function* () {
        const header = {
            remote_user: janusAccountShs.username,
            cookie: 'pll_language=fr; _shibsession_123=456'
        };
        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', header);
        const domains = janusAccountShs.domains.map(d => d.name);

        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign({ shib: '_shibsession_123=456', username: janusAccountShs.username, domains }, auth.cookieSecret)}; path=/; httponly`
        ]);

        assert.deepEqual(yield redis.getAsync('_shibsession_123=456'), jwt.sign({ shib: '_shibsession_123=456', username: janusAccountShs.username, domains }, auth.headerSecret));

        assert.equal(response.statusCode, 302);
        assert.include(response.body, `http://bib.cnrs.fr`);
    });

    it('should set bibapi_token cookie and save headerToken in redis corresponding to user with username equal to header remote_user(user)', function* () {
        const header = {
            remote_user: janusAccount.username,
            cookie: 'pll_language=fr; _shibsession_123=456'
        };
        const domains = janusAccount.domains.map(d => d.name);
        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', header);

        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign({ shib: '_shibsession_123=456', username: janusAccount.username, domains }, auth.cookieSecret)}; path=/; httponly`
        ]);

        assert.deepEqual(yield redis.getAsync('_shibsession_123=456'), jwt.sign({ shib: '_shibsession_123=456', username: janusAccount.username, domains }, auth.headerSecret));

        assert.equal(response.statusCode, 302);
        assert.include(response.body, `http://bib.cnrs.fr`);
    });

    it('should return cookie token with session for shs if called with header.refscientificoffice 54 and no user correspond to remote_user and create corresponding user', function* () {
        const header = {
            remote_user: 'will',
            refscientificoffice: '54->Institut des sciences humaines et sociales',
            cookie: 'pll_language=fr; _shibsession_123=456'
        };
        const domains = institute.domains.map(d => d.name);
        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', header);
        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign({ shib: '_shibsession_123=456', username: 'will', domains }, auth.cookieSecret)}; path=/; httponly`
        ]);
        assert.equal(response.statusCode, 302);
        assert.include(response.body, `http://bib.cnrs.fr`);
        const will = yield janusAccountQueries.selectOneByUsername('will');
        assert.equal(will.username, 'will');
        assert.equal(will.primary_institute, institute.id);
        assert.deepEqual(will.domains, []);
        assert.deepEqual(will.additional_institutes, []);
        assert.deepEqual(will.additional_units, []);
        assert.equal(will.primary_unit, null);
        assert.equal(will.password, null);
    });

    it('should return authorization token with session for shs if called with header.ou UMR746 and no user correspond to remote_user and create corresponding user', function* () {
        const header = {
            remote_user: 'will',
            ou: 'UMR746',
            cookie: 'pll_language=fr; _shibsession_123=456'
        };
        const domains = unit.domains.map(d => d.name);
        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', header);

        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign({ shib: '_shibsession_123=456', username: 'will', domains }, auth.cookieSecret)}; path=/; httponly`
        ]);
        assert.equal(response.statusCode, 302);
        assert.include(response.body, `http://bib.cnrs.fr`);
        const will = yield janusAccountQueries.selectOneByUsername('will');
        assert.equal(will.username, 'will');
        assert.equal(will.primary_institute, null);
        assert.deepEqual(will.domains, []);
        const primaryUnit = yield unitQueries.selectOneByCode('UMR746');
        assert.equal(will.primary_unit, primaryUnit.id);
        assert.deepEqual(will.additional_institutes, []);
        assert.deepEqual(will.additional_units, []);
        assert.equal(will.password, null);
    });

    it('should create received refscientificoffice as institue if it does not exists and assign it to the janusAccount', function* () {
        const header = {
            remote_user: janusAccount.username,
            refscientificoffice: '66->Marmelab',
            cookie: 'pll_language=fr; _shibsession_123=456'
        };
        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', header);

        const domains = janusAccount.domains.map(d => d.name);
        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign({ shib: '_shibsession_123=456', username: janusAccount.username, domains }, auth.cookieSecret)}; path=/; httponly`
        ]);
        assert.equal(response.statusCode, 302);
        const newInstitute = yield instituteQueries.selectOneByCode({ code: '66' });
        assert.equal(newInstitute.code, '66');
        assert.equal(newInstitute.name, 'Marmelab');
        assert.deepEqual(newInstitute.domains, []);

        const updatedUser = yield janusAccountQueries.selectOneByUsername({ username: janusAccount.username });
        assert.equal(updatedUser.primary_institute, newInstitute.id);
    });

    it('should create received header.ou as unit if it does not exists and assign it to the janusAccount', function* () {
        const header = {
            remote_user: janusAccount.username,
            ou: 'Marmelab Unit',
            cookie: 'pll_language=fr; _shibsession_123=456'
        };

        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', header);

        const domains = janusAccount.domains.map(d => d.name);
        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign({ shib: '_shibsession_123=456', username: janusAccount.username, domains }, auth.cookieSecret)}; path=/; httponly`
        ]);
        assert.equal(response.statusCode, 302);
        const newUnit = yield unitQueries.selectOneByCode({ code: 'Marmelab Unit' });
        assert.equal(newUnit.code, 'Marmelab Unit');
        assert.deepEqual(newUnit.domains, []);

        const updatedUser = yield janusAccountQueries.selectOneByUsername({ username: janusAccount.username });
        assert.equal(updatedUser.primary_unit, newUnit.id);
    });

    it('should update janusAccount if called with different refscientificoffice', function* () {
        const header = {
            remote_user: janusAccount.username,
            refscientificoffice: '54->Institut des sciences humaines et sociales',
            cookie: 'pll_language=fr; _shibsession_123=456'
        };
        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', header);

        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign({ shib: '_shibsession_123=456', username: janusAccount.username, domains: ['shs', 'vie'] }, auth.cookieSecret)}; path=/; httponly`
        ]);
        assert.equal(response.statusCode, 302);
        assert.include(response.body, `http://bib.cnrs.fr`);
        const updatedUser = yield janusAccountQueries.selectOneByUsername({ username: janusAccount.username });
        assert.equal(updatedUser.username, janusAccount.username);
        assert.equal(updatedUser.primary_institute, institute.id);
        assert.deepEqual(updatedUser.domains, ['vie', 'shs']);
        assert.equal(updatedUser.primary_unit, null);
        assert.equal(updatedUser.password, null);
    });

    it('should redirect with no domain if user does not exists and has no institute nor unit', function* () {
        const header = {
            remote_user: 'will',
            cookie: 'pll_language=fr; _shibsession_123=456'
        };

        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', header);
        assert.deepEqual(response.headers['set-cookie'], [
            `bibapi_token=${jwt.sign({ shib: '_shibsession_123=456', username: 'will', domains: [] }, auth.cookieSecret)}; path=/; httponly`
        ]);
        assert.equal(response.statusCode, 302);
        assert.include(response.body, `http://bib.cnrs.fr`);
    });

    it('should return 401  if no _shibsession_%d cookie header is present', function* () {
        const header = {
            remote_user: janusAccount.username,
            cookie: 'pll_language=fr; 123=456'
        };
        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', header);
        assert.equal(response.statusCode, 401);
    });

    it('should save all received header as a new renaterHeader', function* () {
        const headers = { cookie: 'pll_language=fr; _shibsession_123=456', cn: 'doe', remote_user: 'john', mail: 'john@doe.fr', what: 'ever'};
        const response = yield request.get('/ebsco/login_renater', headers);
        assert.equal(response.statusCode, 302);
        const renaterHeaders = yield RenaterHeader.find();

        assert.equal(renaterHeaders.length, 1);

        const renaterHeader = renaterHeaders[0].toJSON();

        assert.equal(renaterHeader.cn, headers.cn);
        assert.equal(renaterHeader.remote_user, headers.remote_user);
        assert.equal(renaterHeader.mail, headers.mail);
        assert.equal(renaterHeader.what, headers.what);
    });

    afterEach(function* () {
        yield fixtureLoader.clear();
        request.setToken();
        apiServer.close();
    });
});
