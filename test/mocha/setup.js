'uses trict';

import '../../lib/utils/mongooseConnection';
import command from '../../lib/utils/command';
import path from 'path';
import config from 'config';

import { assert } from 'chai';
import * as requestServer from '../utils/requestServer';
import * as apiServer from '../utils/apiServer';
import getRedisClient from '../../lib/utils/getRedisClient';
import fixtureLoader from '../utils/fixtureLoader';
import { pgClient } from 'co-postgres-queries';

before(function* () {
    const result = yield command(path.join(__dirname, '../../node_modules/migrat/bin/migrat up'));
    global.console.log(result);
    global.assert = assert;
    global.request = requestServer;
    global.apiServer = apiServer;
    global.redis = getRedisClient();
    yield global.redis.selectAsync(2);

    const { user, password, host, port, name } = config.postgres;
    global.postgres = yield pgClient(`postgres://${user}:${password}@${host}:${port}/${name}`);
    global.fixtureLoader = fixtureLoader(global.postgres);

});

after(function () {
    global.request.close();
    global.redis.quit();
    global.postgres.done();
});
