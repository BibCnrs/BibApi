import User from '../../../lib/models/User';
import RenaterHeader from '../../../lib/models/RenaterHeader';

describe.only('POST /ebsco/login_renater', function () {
    let userVie, userShs, user;

    beforeEach(function* () {
        yield ['vie', 'shs']
        .map(name => fixtureLoader.createDomain({ name }));

        yield fixtureLoader.createInstitute({ name: 'inshs', code: '54', domains: ['shs'] });
        yield fixtureLoader.createUnit({ name: 'UMR746', domains: ['vie'] });

        userVie = yield fixtureLoader.createUser({ username: 'john', domains: ['vie'] });
        userShs = yield fixtureLoader.createUser({ username: 'jane', domains: ['shs'] });
        user = yield fixtureLoader.createUser({ username: 'johnny', domains: ['vie', 'shs'] });

        apiServer.start();
    });

    it('should return authorization token corresponding to user with username equal to header remote_user(userVie)', function* () {
        const header = {
            remote_user: userVie.username,
            cookie: '_shibsession_123=456'
        };
        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', null, header).catch(e => e);
        assert.include(response.message, `http://bib.cnrs.fr?shib=${encodeURIComponent(header.cookie)}&amp;token=`);
        assert.equal(response.statusCode, 302);
        assert.include(response.message, `&amp;domains=vie&amp;username=${header.remote_user}`);
    });

    it('should return authorization token corresponding to user with username equal to header remote_user(userShs)', function* () {
        const header = {
            remote_user: userShs.username,
            cookie: '_shibsession_123=456'
        };
        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', null, header).catch(e => e);
        assert.equal(response.statusCode, 302);
        assert.include(response.message, `http://bib.cnrs.fr?shib=${encodeURIComponent(header.cookie)}&amp;token=`);
        assert.include(response.message, `&amp;domains=shs&amp;username=${header.remote_user}`);
    });

    it('should return authorization token corresponding to user with username equal to header remote_user(user)', function* () {
        const header = {
            remote_user: user.username,
            cookie: '_shibsession_123=456'
        };
        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', null, header).catch(e => e);
        assert.equal(response.statusCode, 302);
        assert.include(response.message, `http://bib.cnrs.fr?shib=${encodeURIComponent(header.cookie)}&amp;token=`);
        assert.include(response.message, `&amp;domains=vie&amp;domains=shs&amp;username=${header.remote_user}`);
    });

    it('should return authorization token with session for shs if called with header.refscientificoffice 54 and no user correspond to remote_user and create corresponding user', function* () {
        const header = {
            remote_user: 'will',
            refscientificoffice: '54->Institut des sciences humaines et sociales',
            cookie: '_shibsession_123=456'
        };
        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', null, header).catch(e => e);
        assert.equal(response.statusCode, 302);
        assert.include(response.message, `http://bib.cnrs.fr?shib=${encodeURIComponent(header.cookie)}&amp;token=`);
        assert.include(response.message, `&amp;domains=shs&amp;username=${header.remote_user}`);
        const will = (yield User.findOne({ username: 'will' })).toObject();
        assert.equal(will.username, 'will');
        assert.equal(will.institute, '54');
        assert.deepEqual(will.domains, []);
        assert.equal(will.unit, null);
        assert.equal(will.password, null);
        assert.equal(will.salt, null);
    });

    it('should return authorization token with session for shs if called with header.ou UMR746 and no user correspond to remote_user and create corresponding user', function* () {
        const header = {
            remote_user: 'will',
            ou: 'UMR746',
            cookie: '_shibsession_123=456'
        };
        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', null, header).catch(e => e);
        assert.equal(response.statusCode, 302);
        assert.include(response.message, `http://bib.cnrs.fr?shib=${encodeURIComponent(header.cookie)}&amp;token=`);
        assert.include(response.message, `&amp;domains=vie&amp;username=${header.remote_user}`);
        const will = (yield User.findOne({ username: 'will' })).toObject();
        assert.equal(will.username, 'will');
        assert.equal(will.institute, null);
        assert.deepEqual(will.domains, []);
        assert.equal(will.unit, 'UMR746');
        assert.equal(will.password, null);
        assert.equal(will.salt, null);
    });

    it('should update user if called with different refscientificoffice', function* () {
        const header = {
            remote_user: user.username,
            refscientificoffice: '54->Institut des sciences humaines et sociales',
            cookie: '_shibsession_123=456'
        };
        const response = yield request.get('/ebsco/login_renater?origin=http://bib.cnrs.fr', null, header).catch(e => e);
        assert.equal(response.statusCode, 302);
        assert.include(response.message, `http://bib.cnrs.fr?shib=${encodeURIComponent(header.cookie)}&amp;token=`);
        assert.include(response.message, `&amp;domains=shs&amp;domains=vie&amp;username=${header.remote_user}`);
        const updatedUser = (yield User.findOne({ username: user.username })).toObject();
        assert.equal(updatedUser.username, user.username);
        assert.equal(updatedUser.institute, '54');
        assert.deepEqual(updatedUser.domains, ['vie', 'shs']);
        assert.equal(updatedUser.unit, null);
        assert.equal(updatedUser.password, null);
        assert.equal(updatedUser.salt, null);
    });

    it('should return 401 with wrong password', function* () {
        const error = yield request.get('/ebsco/login_renater', {
            remote_user: 'will'
        }, null).catch((error) => error);
        assert.equal(error.statusCode, 401);
        assert.equal(error.message, '401 - Unauthorized');
    });

    it('should save all received header as a new renaterHeader', function* () {
        const headers = { cn: 'doe', remote_user: 'john', mail: 'john@doe.fr', what: 'ever'};
        const response = yield request.get('/ebsco/login_renater', null, headers).catch(e => e);
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
