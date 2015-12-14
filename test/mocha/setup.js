'uses trict';

import '../../lib/utils/mongooseConnection';

import { assert } from 'chai';
import * as requestServer from '../utils/requestServer';
import * as apiServer from '../utils/apiServer';
import getRedisClient from '../../lib/utils/getRedisClient';
import * as fixtureLoader from '../utils/fixtureLoader';

before(function* () {
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
