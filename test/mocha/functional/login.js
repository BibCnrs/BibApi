import jwt from 'koa-jwt';
import { auth } from 'config';
import { selectOneByUsername } from '../../../lib/models/InistAccount';

describe('POST /ebsco/login', function () {
    let inistAccountVie, inistAccountShs, inistAccount;

    beforeEach(function* () {
        const [vie, shs, reaxys] = yield ['vie', 'shs', 'reaxys'].map((name) =>
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
        yield fixtureLoader.createInistAccount({
            username: 'jane',
            password: 'secret',
            communities: [shs.id, reaxys.id],
        });
        inistAccountShs = yield selectOneByUsername('jane');
        yield fixtureLoader.createInistAccount({
            username: 'johnny',
            password: 'secret',
            communities: [shs.id, vie.id, reaxys.id],
        });
        inistAccount = yield selectOneByUsername('johnny');

        apiServer.start();
    });

    it('should return authorization token with session for vie if called with right password and profile vie', function* () {
        const response = yield request.post(
            '/ebsco/login',
            {
                username: inistAccountVie.username,
                password: inistAccountVie.password,
            },
            true,
        );

        const tokenData = {
            id: inistAccountVie.id,
            username: inistAccountVie.username,
            domains: inistAccountVie.domains,
            groups: inistAccountVie.groups,
            origin: 'inist',
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

        assert.equal(response.body.username, inistAccountVie.username);
        assert.deepEqual(response.body.domains, inistAccountVie.domains);
        const bodyToken = jwt.decode(response.body.token);
        assert.deepEqual(bodyToken, {
            ...tokenData,
            iat: bodyToken.iat,
        });
    });

    it('should return authorization token with session for shs if called with right password and profile shs', function* () {
        const response = yield request.post(
            '/ebsco/login',
            {
                username: inistAccountShs.username,
                password: inistAccountShs.password,
            },
            true,
        );

        const tokenData = {
            id: inistAccountShs.id,
            username: inistAccountShs.username,
            domains: inistAccountShs.domains,
            groups: inistAccountShs.groups,
            origin: 'inist',
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

        assert.equal(response.body.username, inistAccountShs.username);
        assert.deepEqual(response.body.domains, inistAccountShs.domains);
        const bodyToken = jwt.decode(response.body.token);
        assert.deepEqual(bodyToken, {
            ...tokenData,
            iat: bodyToken.iat,
        });
    });

    it('should return authorization token with session for shs and vie if called with right password and profile shs and vie', function* () {
        const response = yield request.post('/ebsco/login', {
            username: inistAccount.username,
            password: inistAccount.password,
        });

        const tokenData = {
            id: inistAccount.id,
            username: inistAccount.username,
            domains: inistAccount.domains,
            groups: inistAccount.groups,
            origin: 'inist',
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

        assert.equal(response.body.username, inistAccount.username);
        assert.deepEqual(response.body.domains, inistAccount.domains);
        const bodyToken = jwt.decode(response.body.token);
        assert.deepEqual(bodyToken, {
            ...tokenData,
            iat: bodyToken.iat,
        });
    });

    it('should return 401 with wrong password', function* () {
        const response = yield request.post('/ebsco/login', {
            username: 'john',
            password: 'doe',
        });
        assert.equal(response.statusCode, 401);
        assert.equal(response.body, 'Unauthorized');
    });

    afterEach(function* () {
        request.setToken();
        apiServer.close();
        yield fixtureLoader.clear();
    });
});
