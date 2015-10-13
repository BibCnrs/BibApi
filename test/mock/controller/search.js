'use strict';

import aidsResult from './aidsResult.json';
export default function* search () {
    this.status = 200;
    this.body = aidsResult;
}
