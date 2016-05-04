'use strict';

require('babel/register')({ blacklist: [ 'regenerator' ] });
require('../lib/utils/mongooseConnection');
var Domain = require('../lib/models/Domain');

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

    const allowedDomains = (yield Domain.find({})).map(domain => domain.name);
    let domains = [];
    for (var domain of allowedDomains) {
        let hasDomain;
        while (!hasDomain) {
            const entry = yield readline.question_(`add domain ${domain} ? (y/n)`);
            if (entry === 'y' || entry === 'n') {
                hasDomain = entry;
            }
        }

        if (hasDomain === 'y') {
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
