'use strict';

require('babel/register')({ blacklist: [ 'regenerator' ] });
const config = require('config');
const PgPool = require('co-postgres-queries').PgPool;

var co = require('co');

var readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

var AdminUser = require('../lib/models/AdminUser');

readline.question_ = function (text) {
    return function (done) {
        readline.question(text, function (answer) {
            done(null, answer);
        });
    };
};

co(function* () {
    const pool = new PgPool({
        user: config.postgres.user,
        password: config.postgres.password,
        host: config.postgres.host,
        port: config.postgres.port,
        database: config.postgres.database
    });
    const adminUserQueries = AdminUser(pool);

    var username;
    while (!username) {
        username = yield readline.question_('choose a username:');

        if (yield adminUserQueries.selectOneByUsername(username)) {
            global.console.log('An admin already exists with this username');
            username = null;
        }
    }

    var password;
    while (!password) {
        password = yield readline.question_('Enter the password:');
    }

    yield adminUserQueries.insertOne({username, password});
})
.catch(function (error) {
    global.console.error(error);

    return error;
})
.then(function (error) {
    process.exit(error ? 1 : 0);
});
