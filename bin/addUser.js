'use strict';

require('babel/register')({ blacklist: [ 'regenerator' ] });
require('../lib/utils/mongooseConnection');

var co = require('co');

var readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

var User = require('../lib/models/User');
var fixtureLoader = require('../test/utils/fixtureLoader');

readline.question_ = function (text) {
    return function (done) {
        readline.question(text, function (answer) {
            done(null, answer);
        });
    };
};

const allowedDomains = ['vie', 'shs'];

co(function* () {
    var username;
    while (!username) {
        username = yield readline.question_('choose an user name:');
        if (yield User.findOne({username})) {
            console.log('An user already exists with this login');
            username = null;
        }
    }

    var password;
    while (!password) {
        password = yield readline.question_('Enter the password:');
    }

    let domains = [];
    for (var domain of allowedDomains) {
        let hasDomain;
        while (!hasDomain) {
            hasDomain = yield readline.question_(`add domain ${domain} ? (y/n)`);

            if (hasDomain !== 'y' && hasDomain !== 'n') {
                hasDomain = null;
                break;
            }

            hasDomain = hasDomain === 'y';
        }
        if (hasDomain) {
            domains.push(domain);
        }
    }
    yield fixtureLoader.createUser({username, password, domains});
})
.catch(function (error) {
    console.error(error);

    return error;
})
.then(function (error) {
    process.exit(error ? 1 : 0);
});
