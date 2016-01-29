'use strict';

require('babel/register')({ blacklist: [ 'regenerator' ] });
require('../lib/utils/mongooseConnection');

var co = require('co');

var readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

var AdminUser = require('../lib/models/AdminUser');
var fixtureLoader = require('../test/utils/fixtureLoader');

readline.question_ = function (text) {
    return function (done) {
        readline.question(text, function (answer) {
            done(null, answer);
        });
    };
};

co(function* () {
    var username;
    while (!username) {
        username = yield readline.question_('choose a username:');
        if (yield AdminUser.findOne({username})) {
            console.log('An admin already exists with this username');
            username = null;
        }
    }

    var password;
    while (!password) {
        password = yield readline.question_('Enter the password:');
    }

    yield fixtureLoader.createAdminUser({username, password});
})
.catch(function (error) {
    console.error(error);

    return error;
})
.then(function (error) {
    process.exit(error ? 1 : 0);
});
