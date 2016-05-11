import User from '../../../lib/models/User';

describe('model User', function () {

    describe('Authenticate', function () {

        before(function* () {
            yield fixtureLoader.createUser({ username: 'john', password: 'secret'});
        });

        it('should return user if given good password', function* () {
            let result = yield User.authenticate('john', 'secret');
            assert.equal(result.get('username'), 'john');
        });

        it('should return false if given wrong password', function* () {
            let result = yield User.authenticate('john', 'wrong');

            assert.isFalse(result);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('update', function () {
        let user;

        beforeEach(function* () {
            yield fixtureLoader.createUser({ username: 'john', password: 'secret'});
            user = (yield User.findOne({ username: 'john' })).toObject();
        });

        it('should update user without touching password if none is provided', function* () {
            yield User.findOneAndUpdate({username: 'john' }, { username: 'johnny' });

            const updatedUser = (yield User.findOne({ username: 'johnny' })).toObject();

            assert.deepEqual(updatedUser, {
                ...user,
                username: 'johnny'
            });
        });

        it('should hash password ang generate new salt if password is provided', function* () {
            yield User.findOneAndUpdate({username: 'john' }, { password: 'betterSecret' });

            const updatedUser = (yield User.findOne({ username: 'john' })).toObject();

            assert.notEqual(updatedUser.password, user.password);
            assert.notEqual(updatedUser.salt, user.salt);
        });

        it('should throw an error if trying to add a domain which does not exists', function* () {
            let error;
            try {
                yield User.findOneAndUpdate({username: 'john' }, { domains: ['nemo'] });
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Domain { name: nemo } does not exists');
        });

        it('should throw an error if trying to add an institute which does not exists', function* () {
            let error;
            try {
                yield User.findOneAndUpdate({username: 'john' }, { institute: 'nemo' });
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Institute { code: nemo } does not exists');
        });

        it('should throw an error if trying to add an unit which does not exists', function* () {
            let error;
            try {
                yield User.findOneAndUpdate({username: 'john' }, { unit: 'nemo' });
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Unit { name: nemo } does not exists');
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('create', function () {

        it('should hash password ang generate salt', function* () {
            const user = (yield User.create({username: 'john', password: 'secret' })).toObject();

            assert.equal(user.username, 'john');
            assert.isNotNull(user.salt);
            assert.notEqual(user.password, 'secret');
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('instituteDomains', function () {
        let nuclear, jane;
        before(function* () {
            nuclear = yield fixtureLoader.createDomain({ name: 'nuclear', gate: 'in2p3'});
            yield fixtureLoader.createInstitute({ name: 'nuclear', code: '57', domains: ['nuclear']});
            yield fixtureLoader.createUser({ username: 'jane', password: 'secret', domains: [], institute: '57'});

            jane = yield User.findOne({ username: 'jane' });
        });

        it('should retrieve domains from institute', function* () {
            const instituteDomains = yield jane.instituteDomains;
            assert.deepEqual(instituteDomains.map(d => d.toObject()), [nuclear]);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('unitDomains', function () {
        let nuclear, jane;
        before(function* () {
            nuclear = yield fixtureLoader.createDomain({ name: 'nuclear', gate: 'in2p3'});
            yield fixtureLoader.createUnit({ name: 'CERN', domains: ['nuclear']});
            yield fixtureLoader.createUser({ username: 'jane', password: 'secret', domains: [], unit: 'CERN'});

            jane = yield User.findOne({ username: 'jane' });
        });

        it('should retrieve domains from unit', function* () {
            const unitDomains = yield jane.unitDomains;
            assert.deepEqual(unitDomains.map(d => d.toObject()), [nuclear]);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('allDomains', function () {
        let vie, shs, nuclear, universe, jane, instituteUser, unitUser, domainUser;

        before(function* () {
            vie = yield fixtureLoader.createDomain({ name: 'vie', gate: 'insb'});
            shs = yield fixtureLoader.createDomain({ name: 'shs', gate: 'inshs'});
            nuclear = yield fixtureLoader.createDomain({ name: 'nuclear', gate: 'in2p3'});
            universe = yield fixtureLoader.createDomain({ name: 'universe', gate: 'insu'});
            yield fixtureLoader.createInstitute({ name: 'Institut des sciences humaines et sociales', code: '54', domains: ['shs', 'universe']});
            yield fixtureLoader.createInstitute({ name: 'empty', code: '00', domains: []});
            yield fixtureLoader.createUnit({ name: 'CERN', domains: ['nuclear']});
            yield fixtureLoader.createUnit({ name: 'NULL', domains: []});
            yield fixtureLoader.createUser({ username: 'jane', password: 'secret', domains: ['vie', 'universe'], institute: '54', unit: 'CERN'});
            yield fixtureLoader.createUser({ username: 'institute user', domains: [], institute: '54', unit: 'NULL'});
            yield fixtureLoader.createUser({ username: 'unit user', domains: [], institute: '00', unit: 'CERN'});
            yield fixtureLoader.createUser({ username: 'domains user', domains: ['shs', 'nuclear'], institute: '00', unit: 'NULL'});

            jane = yield User.findOne({ username: 'jane' });
            instituteUser = yield User.findOne({ username: 'institute user' });
            unitUser = yield User.findOne({ username: 'unit user' });
            domainUser = yield User.findOne({ username: 'domains user' });
        });

        it('should retrieve domains from intitute then unit then domains with no duplicate', function* () {
            const allDomains = yield jane.allDomains;
            assert.deepEqual(allDomains.map(d => d.toObject()), [shs, universe, nuclear, vie]);
        });

        it('should retrieve domains from institute', function* () {
            const allDomains = yield instituteUser.allDomains;
            assert.deepEqual(allDomains.map(d => d.toObject()), [shs, universe]);
        });

        it('should retrieve domains from unit', function* () {
            const allDomains = yield unitUser.allDomains;
            assert.deepEqual(allDomains.map(d => d.toObject()), [nuclear]);
        });

        it('should retrieve domains from domains', function* () {
            const allDomains = yield domainUser.allDomains;
            assert.deepEqual(allDomains.map(d => d.toObject()), [shs, nuclear]);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('gates', function () {
        let jane;
        before(function* () {
            yield fixtureLoader.createDomain({ name: 'vie', gate: 'insb'});
            yield fixtureLoader.createDomain({ name: 'shs', gate: 'inshs'});
            yield fixtureLoader.createUser({ username: 'jane', password: 'secret', domains: ['vie', 'shs']});

            jane = yield User.findOne({ username: 'jane' });
        });

        it('should return list of gates corresponding to domains', function* () {
            assert.deepEqual(yield jane.gatesPromises, ['insb', 'inshs']);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

});
