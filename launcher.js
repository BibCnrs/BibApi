'use strict';

require('babel/register')({ blacklist: [ 'regenerator' ] });
var config = require('config');

var app = require('./server');

if (!module.parent) {
    app.listen(config.port);

    console.log('Server listening on port ' + config.port);
    console.log('Press CTRL+C to stop server');
}
