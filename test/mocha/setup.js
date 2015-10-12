'uses trict';

import { assert } from 'chai';
import * as requestServer from '../utils/requestServer';
import * as apiServer from '../utils/apiServer';

before(function () {
    global.assert = assert;
    global.request = requestServer;
});

after(function () {
    global.request.close();
    apiServer.close();
});
