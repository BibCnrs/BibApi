'uses trict';

import '../../lib/utils/mongooseConnection';
import command from '../../lib/utils/command';
import path from 'path';

import { assert } from 'chai';
import * as requestServer from '../utils/requestServer';
import * as apiServer from '../utils/apiServer';
import getRedisClient from '../../lib/utils/getRedisClient';
import * as fixtureLoader from '../utils/fixtureLoader';

before(function* () {
    const result = yield command(path.join(__dirname, '../../node_modules/migrat/bin/migrat up'));
    global.console.log(result);
    global.assert = assert;
    global.request = requestServer;
    global.apiServer = apiServer;
    global.redis = getRedisClient();
    global.fixtureLoader = fixtureLoader;
    yield global.redis.selectAsync(2);
});

after(function () {
    global.request.close();
    global.redis.quit();
});
