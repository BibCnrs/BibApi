'use strict';

require('babel/register')({ blacklist: [ 'regenerator' ] });
const config = require('config');
const pgClient = require('co-postgres-queries').pgClient;

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
    const db = yield pgClient(`postgres://${config.postgres.user}:${config.postgres.password}@${config.postgres.host}:${config.postgres.port}/${config.postgres.name}`);
    var username;
    while (!username) {
        username = yield readline.question_('choose a username:');

        if (yield AdminUser(db).selectOneByUsername(username)) {
            console.log('An admin already exists with this username');
            username = null;
        }
    }

    var password;
    while (!password) {
        password = yield readline.question_('Enter the password:');
    }

    yield fixtureLoader(db).createAdminUser({username, password});
})
.catch(function (error) {
    console.error(error);

    return error;
})
.then(function (error) {
    process.exit(error ? 1 : 0);
});
