import 'babel-polyfill';
import path from 'path';
import config from 'config';
import { assert } from 'chai';
import { PgPool } from 'co-postgres-queries';

import command from '../../lib/utils/command';
import * as requestServer from '../utils/requestServer';
import apiServer from '../utils/apiServer';
import getRedisClient from '../../lib/utils/getRedisClient';
import fixtureLoader from '../utils/fixtureLoader';

before(function* () {
    const result = yield command(path.join(__dirname, '../../node_modules/migrat/bin/migrat up'));
    global.console.log(result);
    global.assert = assert;
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
        database
    });
    global.postgres = yield global.pool.connect();
    global.fixtureLoader = fixtureLoader(global.postgres);
});

after(function () {
    global.request.close();
    global.redis.quit();
    global.postgres.release();
    global.pool.end();
});
