'use strict';

require('babel/register')({ blacklist: [ 'regenerator' ] });
require('../lib/utils/mongooseConnection');
var _ = require('lodash');
var Domain = require('../lib/models/Domain');
var User = require('../lib/models/User');
var Institute = require('../lib/models/Institute');
var Unit = require('../lib/models/Unit');

var co = require('co');

// var User = require('../lib/models/User');
var fixtureLoader = require('../test/utils/fixtureLoader');

co(function* () {
    yield fixtureLoader.clear();
    yield ['in2p3','inc','inee','inp','ins2i','insb','inshs','insis','insmi','insu']
    .map(name => fixtureLoader.createDomain({ name }));

    const insmi = yield Domain.findOne({ name: 'insmi' });
    const insu = yield Domain.findOne({ name: 'insu' });

    const unit1 = yield fixtureLoader.createUnit({ name: 'unit1', domains: ['in2p3','inc'] });
    const unit2 = yield fixtureLoader.createUnit({ name: 'unit2', domains: ['inee','inp'] });

    const institute1 = yield fixtureLoader.createInstitute({ name: 'institute1', code: 'institute1', domains: ['ins2i','insb'] });
    const institute2 = yield fixtureLoader.createInstitute({ name: 'institute2', code: 'institute2', domains: ['inshs','insis'] });

    yield Domain.ensureIndexes();
    yield Unit.ensureIndexes();
    yield Institute.ensureIndexes();
    yield User.ensureIndexes();

    console.log('creating 40000 users');

    const users =  _.range(40000).map(index => ({
        username: `user${index}`,
        primaryInstitute: institute1._id,
        additionalInstitutes: [institute2._id] ,
        primaryUnit: unit1._id,
        additionalUnits: unit2._id,
        domains: [insmi._id, insu._id]
    }));
    console.log('users array ready');

    yield User.insertMany(users);

    console.log('created 40000 users');

    console.log('retrieving savedUsers');
    const start = Date.now();


    for(var offset = 0; offset < 40000; offset+=1000) {
        const savedUsers = yield User.find({}).limit(1000).skip(offset);
        console.log('savedUsers retrieval:', offset);


        console.log('populating saved user', offset);
        const data = yield savedUsers.map(user => co(function* () {
            return {
                allDomains: (yield user.allDomains).map(d => d.name),
                institutes: yield user.institutes,
                units: yield user.units
            };
        }));

        console.log('populated saved user', offset);
    }
    const end = Date.now();
    console.log(Math.round((end - start) / 1000), 's');


    // var username;
    // while (!username) {
    //     username = yield readline.question_('choose an user name:');
    //     if (yield User.findOne({username})) {
    //         console.log('An user already exists with this login');
    //         username = null;
    //     }
    // }
    //
    // var password;
    // while (!password) {
    //     password = yield readline.question_('Enter the password:');
    // }
    //
    // const allowedDomains = (yield Domain.find({})).map(domain => domain.name);
    // let domains = [];
    // for (var domain of allowedDomains) {
    //     let hasDomain;
    //     while (!hasDomain) {
    //         const entry = yield readline.question_(`add domain ${domain} ? (y/n)`);
    //         if (entry === 'y' || entry === 'n') {
    //             hasDomain = entry;
    //         }
    //     }
    //
    //     if (hasDomain === 'y') {
    //         domains.push(domain);
    //     }
    // }
    // yield fixtureLoader.createUser({username, password, domains});
})
.catch(function (error) {
    console.error(error);

    return error;
})
.then(function (error) {
    process.exit(error ? 1 : 0);
});
