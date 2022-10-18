'use strict';

require('babel-register');

var co = require('co');
const { selectOneByUsername, insertOne } = require('../lib/models/AdminUser');

var readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

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

        if (yield selectOneByUsername(username)) {
            global.console.log('An admin already exists with this username');
            username = null;
        }
    }

    var password;
    while (!password) {
        password = yield readline.question_('Enter the password:');
    }

    yield insertOne({ username, password });
})
    .catch(function (error) {
        global.console.error(error);

        return error;
    })
    .then(function (error) {
        process.exit(error ? 1 : 0);
    });
