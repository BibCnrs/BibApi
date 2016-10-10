'use strict';
require('babel-register');
var config = require('config');
var path =  require('path');

var app = require('./server').default;
var command = require('./lib/utils/command').default;

if (!module.parent) {

    command(path.join(__dirname, './node_modules/migrat/bin/migrat up'))
    .then((result) => {
        global.console.log(result);
        app.listen(config.port);
    }, (error) => {
        global.console.error(error);
    });

    global.console.log('Server listening on port ' + config.port);
    global.console.log('Press CTRL+C to stop server');
}
