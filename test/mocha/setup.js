import path from 'path';
import chai from 'chai';
import spies from 'chai-spies';
chai.use(spies);

import command from '../../lib/utils/command';
import * as requestServer from '../utils/requestServer';
import apiServer from '../utils/apiServer';
import getRedisClient from '../../lib/utils/getRedisClient';
import fixtureLoader from '../utils/fixtureLoader';
import * as mailServer from '../utils/mailServer';
import prisma from '../../prisma/prisma';

before(function* () {
    console.log('############## INIT');
    const result = yield command(
        path.join(__dirname, '../../node_modules/migrat/bin/migrat up'),
    );
    global.console.log(result);
    console.log('############## 1');
    global.assert = chai.assert;
    global.expect = chai.expect;
    global.spy = chai.spy;
    console.log('############## 2');
    global.request = requestServer;
    global.apiServer = apiServer;
    console.log('############## 3');
    global.redis = getRedisClient();
    yield global.redis.selectAsync(2);
    console.log('############## 4');
    global.fixtureLoader = fixtureLoader();
    global.mailServer = mailServer;
});

after(function () {
    global.request.close();
    global.redis.quit();
    global.postgres.release();
    global.pool.end();
});
