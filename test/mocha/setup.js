'uses trict';

import { assert } from 'chai';
import * as requestServer from '../utils/requestServer';

before(function () {
    global.assert = assert;
    global.request = requestServer;
});

after(function () {
    global.request.close();
});
