import path from 'path';
import config from 'config';
import chai from 'chai';
import spies from 'chai-spies';
chai.use(spies);

import { PgPool } from 'co-postgres-queries';

import command from '../../lib/utils/command';
import * as requestServer from '../utils/requestServer';
import apiServer from '../utils/apiServer';
import getRedisClient from '../../lib/utils/getRedisClient';
import fixtureLoader from '../utils/fixtureLoader';
import * as mailServer from '../utils/mailServer';

before(function* () {
    const result = yield command(
        path.join(__dirname, '../../node_modules/migrat/bin/migrat up'),
    );
    global.console.log(result);
    global.assert = chai.assert;
    global.expect = chai.expect;
    global.spy = chai.spy;
    global.request = requestServer;
    global.apiServer = apiServer;
    global.redis = getRedisClient();
    yield global.redis.selectAsync(2);

    const { user, password, host, port, database } = config.postgres;
    global.pool = new PgPool({
        user,
        password,
        host,
        port,
        database,
    });
    global.postgres = yield global.pool.connect();
    global.fixtureLoader = fixtureLoader(global.postgres);
    global.mailServer = mailServer;
});

after(function () {
    global.request.close();
    global.redis.quit();
    global.postgres.release();
    global.pool.end();
});
