import { selectOneByUsername } from '../../../lib/models/InistAccount';
import { assert } from 'chai';

describe('POST /ebsco/logout', function () {
    let inistAccountVie;

    beforeEach(function* () {
        const [vie, reaxys] = yield ['vie', 'reaxys'].map((name) =>
            fixtureLoader.createCommunity({
                name,
                gate: `in${name}`,
                ebsco: name !== 'reaxys',
            }),
        );

        yield fixtureLoader.createInistAccount({
            username: 'john',
            password: 'secret',
            communities: [vie.id, reaxys.id],
        });
        inistAccountVie = yield selectOneByUsername('john');

        apiServer.start();
    });

    it('should delete cookie after logout request if a user is connected', function* () {
        const responseLogin = yield request.post(
            '/ebsco/login',
            {
                username: inistAccountVie.username,
                password: inistAccountVie.password,
            },
            true,
        );
        assert.match(responseLogin.headers['set-cookie'][0], /bibapi_token=ey/);
        const responseLogout = yield request.post('/ebsco/logout', {}, true);
        assert.match(responseLogout.headers['set-cookie'][0], /bibapi_token=;/);
    });

    afterEach(function* () {
        request.setToken();
        apiServer.close();
        yield fixtureLoader.clear();
    });
});
