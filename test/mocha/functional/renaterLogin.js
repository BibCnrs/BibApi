import RenaterHeader from '../../../lib/models/RenaterHeader';

describe('POST /ebsco/renater_login', function () {
    let userVie, userShs, user;

    beforeEach(function* () {
        yield ['vie', 'shs']
        .map(name => fixtureLoader.createDomain({ name }));

        userVie = yield fixtureLoader.createUser({ username: 'john', password: 'secret', domains: ['vie'] });
        userShs = yield fixtureLoader.createUser({ username: 'jane', password: 'secret', domains: ['shs'] });
        user = yield fixtureLoader.createUser({ username: 'johnny', password: 'secret', domains: ['vie', 'shs'] });

        apiServer.start();
    });

    it('should return authorization token with session for vie if called with right header', function* () {
        const header = {
            remote_user: userVie.username,
            cookie: '_shibsession_123=456'
        };
        const response = yield request.get('/ebsco/renater_login?origin=http://bib.cnrs.fr', null, header).catch(e => e);
        assert.equal(response.statusCode, 302);
        assert.include(response.message, `http://bib.cnrs.fr?shib=${encodeURIComponent(header.cookie)}&amp;token=`);
        assert.include(response.message, `&amp;domains=vie&amp;username=${header.remote_user}`);
    });

    it('should return authorization token with session for shs if called with header.remote_user corresponding to a user withg access to profile shs', function* () {
        const header = {
            remote_user: userShs.username,
            cookie: '_shibsession_123=456'
        };
        const response = yield request.get('/ebsco/renater_login?origin=http://bib.cnrs.fr', null, header).catch(e => e);
        assert.equal(response.statusCode, 302);
        assert.include(response.message, `http://bib.cnrs.fr?shib=${encodeURIComponent(header.cookie)}&amp;token=`);
        assert.include(response.message, `&amp;domains=shs&amp;username=${header.remote_user}`);
    });

    it('should return authorization token with session for shs if called with header.remote_user corresponding to a user with access to vie and shs', function* () {
        const header = {
            remote_user: user.username,
            cookie: '_shibsession_123=456'
        };
        const response = yield request.get('/ebsco/renater_login?origin=http://bib.cnrs.fr', null, header).catch(e => e);
        assert.equal(response.statusCode, 302);
        assert.include(response.message, `http://bib.cnrs.fr?shib=${encodeURIComponent(header.cookie)}&amp;token=`);
        assert.include(response.message, `&amp;domains=vie&amp;domains=shs&amp;username=${header.remote_user}`);
    });

    it('should return authorization token with session for shs if called with header.refscientificoffice 53 and no user correspond to remote_user', function* () {
        const header = {
            remote_user: 'will',
            refscientificoffice: '54',
            cookie: '_shibsession_123=456'
        };
        const response = yield request.get('/ebsco/renater_login?origin=http://bib.cnrs.fr', null, header).catch(e => e);
        assert.equal(response.statusCode, 302);
        assert.include(response.message, `http://bib.cnrs.fr?shib=${encodeURIComponent(header.cookie)}&amp;token=`);
        assert.include(response.message, `&amp;domains=inshs&amp;username=${header.remote_user}`);
    });

    it('should return 401 with wrong password', function* () {
        const error = yield request.get('/ebsco/renater_login', {
            remote_user: 'will'
        }, null).catch((error) => error);
        assert.equal(error.statusCode, 401);
        assert.equal(error.message, '401 - Unauthorized');
    });

    it('should save all received header as a new renaterHeader', function* () {
        const headers = { cn: 'doe', remote_user: 'john', mail: 'john@doe.fr', what: 'ever'};
        const response = yield request.get('/ebsco/renater_login', null, headers).catch(e => e);
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
        apiServer.close();
        yield fixtureLoader.clear();
    });
});
