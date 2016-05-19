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

        it('should throw an error if trying to add a additionalInstitutes which does not exists', function* () {
            let error;
            try {
                yield User.findOneAndUpdate({username: 'john' }, { additionalInstitutes: ['nemo'] });
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Institute { code: nemo } does not exists');
        });

        it('should throw an error if trying to add a primaryInstitute which does not exists', function* () {
            let error;
            try {
                yield User.findOneAndUpdate({username: 'john' }, { primaryInstitute: 'nemo' });
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Institute { code: nemo } does not exists');
        });

        it('should throw an error if trying to add an additionalUnits which does not exists', function* () {
            let error;
            try {
                yield User.findOneAndUpdate({username: 'john' }, { additionalUnits: ['nemo'] });
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Unit { name: nemo } does not exists');
        });

        it('should throw an error if trying to add a primaryUnit which does not exists', function* () {
            let error;
            try {
                yield User.findOneAndUpdate({username: 'john' }, { primaryUnit: 'nemo' });
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

    describe('institutes', function () {
        let onlyPrimary, onlyAdditional, both, none;

        before(function* () {
            yield fixtureLoader.createInstitute({ name: 'nuclear', code: '57'});
            yield fixtureLoader.createInstitute({ name: 'terre', code: '58'});
            yield fixtureLoader.createInstitute({ name: 'vie', code: '59'});
            yield fixtureLoader.createUser({ username: 'both', domains: [], password: 'secret', primaryInstitute: ['57'], additionalInstitutes: ['58', '59']});
            yield fixtureLoader.createUser({ username: 'onlyPrimary',  domains: [], password: 'secret', primaryInstitute: ['57'], additionalInstitutes: []});
            yield fixtureLoader.createUser({ username: 'onlyAdditional',  domains: [], password: 'secret',  additionalInstitutes: ['58', '59']});
            yield fixtureLoader.createUser({ username: 'none',  domains: [], password: 'secret', additionalInstitutes: []});

            both = yield User.findOne({ username: 'both' });
            onlyPrimary = yield User.findOne({ username: 'onlyPrimary' });
            onlyAdditional = yield User.findOne({ username: 'onlyAdditional' });
            none = yield User.findOne({ username: 'none' });
        });

        it('should return all institutes', function () {
            assert.deepEqual(both.institutes, ['57', '58', '59']);
        });

        it('should return only primaryInstitute if no additionalInstitutes', function () {
            assert.deepEqual(onlyPrimary.institutes, ['57']);
        });

        it('should return only additionalInstitutes if no primaryInstitute', function () {
            assert.deepEqual(onlyAdditional.institutes, ['58', '59']);
        });

        it('should return no institute no primaryInstitute nor additionalInstitutes', function () {
            assert.deepEqual(none.institutes, []);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });

    });

    describe('units', function () {
        let onlyPrimary, onlyAdditional, both, none;

        before(function* () {
            yield fixtureLoader.createUnit({ name: 'nuclear'});
            yield fixtureLoader.createUnit({ name: 'terre'});
            yield fixtureLoader.createUnit({ name: 'vie'});
            yield fixtureLoader.createUser({ username: 'both', domains: [], password: 'secret', primaryUnit: ['nuclear'], additionalUnits: ['terre', 'vie']});
            yield fixtureLoader.createUser({ username: 'onlyPrimary',  domains: [], password: 'secret', primaryUnit: ['nuclear'], additionalUnits: []});
            yield fixtureLoader.createUser({ username: 'onlyAdditional',  domains: [], password: 'secret',  additionalUnits: ['terre', 'vie']});
            yield fixtureLoader.createUser({ username: 'none',  domains: [], password: 'secret', additionalUnits: []});

            both = yield User.findOne({ username: 'both' });
            onlyPrimary = yield User.findOne({ username: 'onlyPrimary' });
            onlyAdditional = yield User.findOne({ username: 'onlyAdditional' });
            none = yield User.findOne({ username: 'none' });
        });

        it('should return all units', function () {
            assert.deepEqual(both.units, ['nuclear', 'terre', 'vie']);
        });

        it('should return only primaryInstitute if no additionalunits', function () {
            assert.deepEqual(onlyPrimary.units, ['nuclear']);
        });

        it('should return only additionalunits if no primaryInstitute', function () {
            assert.deepEqual(onlyAdditional.units, ['terre', 'vie']);
        });

        it('should return no institute no primaryInstitute nor additionalunits', function () {
            assert.deepEqual(none.units, []);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });

    });

    describe('instituteDomains', function () {
        let jane, nuclear, terre;
        before(function* () {
            nuclear = yield fixtureLoader.createDomain({ name: 'nuclear', gate: 'in2p3'});
            terre = yield fixtureLoader.createDomain({ name: 'terre', gate: 'insu'});
            yield fixtureLoader.createInstitute({ name: 'nuclear', code: '57', domains: ['nuclear']});
            yield fixtureLoader.createInstitute({ name: 'terre', code: '58', domains: ['terre']});
            yield fixtureLoader.createUser({ username: 'jane', password: 'secret', domains: [], additionalInstitutes: ['57', '58']});

            jane = yield User.findOne({ username: 'jane' });
        });

        it('should retrieve domains from institute', function* () {
            const instituteDomains = yield jane.instituteDomains;
            assert.deepEqual(jane.institutes, ['57', '58']);
            assert.deepEqual(instituteDomains.map(d => d.toObject()), [nuclear, terre]);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('unitDomains', function () {
        let jane, nuclear, terre;
        before(function* () {
            nuclear = yield fixtureLoader.createDomain({ name: 'nuclear', gate: 'in2p3'});
            terre = yield fixtureLoader.createDomain({ name: 'terre', gate: 'insu'});
            yield fixtureLoader.createUnit({ name: 'CERN', domains: ['nuclear']});
            yield fixtureLoader.createUnit({ name: 'UNICEF', domains: ['terre']});
            yield fixtureLoader.createUser({ username: 'jane', password: 'secret', domains: [], additionalUnits: ['CERN', 'UNICEF']});

            jane = yield User.findOne({ username: 'jane' });
        });

        it('should retrieve domains from unit', function* () {
            const unitDomains = yield jane.unitDomains;
            assert.deepEqual(unitDomains.map(d => d.toObject()), [nuclear, terre]);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('allDomains', function () {
        let vie, shs, nuclear, terre, jane, primaryInstituteUser, primaryUnitUser, additionalInstitutesUser, additionalUnitsUser, domainUser;

        before(function* () {
            vie = yield fixtureLoader.createDomain({ name: 'vie', gate: 'insb'});
            shs = yield fixtureLoader.createDomain({ name: 'shs', gate: 'inshs'});
            nuclear = yield fixtureLoader.createDomain({ name: 'nuclear', gate: 'in2p3'});
            terre = yield fixtureLoader.createDomain({ name: 'terre', gate: 'insu'});

            yield fixtureLoader.createInstitute({ name: 'Institut de la biologie', code: '53', domains: ['vie']});
            yield fixtureLoader.createInstitute({ name: 'Institut des sciences humaines et sociales', code: '54', domains: ['shs', 'terre']});
            yield fixtureLoader.createInstitute({ name: 'empty', code: '00', domains: []});

            yield fixtureLoader.createUnit({ name: 'UNICEF', domains: ['vie']});
            yield fixtureLoader.createUnit({ name: 'CERN', domains: ['nuclear']});
            yield fixtureLoader.createUnit({ name: 'NULL', domains: []});

            yield fixtureLoader.createUser({ username: 'jane', password: 'secret', domains: ['vie', 'terre'], primaryInstitute: '54', primaryUnit: 'CERN'});
            yield fixtureLoader.createUser({ username: 'primary institute user', domains: [], primaryInstitute: '54', primaryUnit: 'NULL'});
            yield fixtureLoader.createUser({ username: 'primary unit user', domains: [], primaryInstitute: '00', primaryUnit: 'CERN' });
            yield fixtureLoader.createUser({ username: 'additional institutes user', domains: [], additionalInstitutes: ['53', '54']});
            yield fixtureLoader.createUser({ username: 'additional units user', domains: [], additionalUnits: ['CERN', 'UNICEF'] });
            yield fixtureLoader.createUser({ username: 'domains user', domains: ['shs', 'nuclear'], primaryInstitute: '00', primaryUnit: 'NULL' });

            jane = yield User.findOne({ username: 'jane' });
            primaryInstituteUser = yield User.findOne({ username: 'primary institute user' });
            primaryUnitUser = yield User.findOne({ username: 'primary unit user' });
            additionalInstitutesUser = yield User.findOne({ username: 'additional institutes user' });
            additionalUnitsUser = yield User.findOne({ username: 'additional units user' });
            domainUser = yield User.findOne({ username: 'domains user' });
        });

        it('should retrieve domains from intitute then unit then domains with no duplicate', function* () {
            const allDomains = yield jane.allDomains;
            assert.deepEqual(allDomains.map(d => d.toObject()), [shs, terre, nuclear, vie]);
        });

        it('should retrieve domains from primaryInstitute', function* () {
            const allDomains = yield primaryInstituteUser.allDomains;
            assert.deepEqual(allDomains.map(d => d.toObject()), [shs, terre]);
        });

        it('should retrieve domains from primaryUnit', function* () {
            const allDomains = yield primaryUnitUser.allDomains;
            assert.deepEqual(allDomains.map(d => d.toObject()), [nuclear]);
        });

        it('should retrieve domains from additionalInstitutes', function* () {
            const allDomains = yield additionalInstitutesUser.allDomains;
            assert.deepEqual(allDomains.map(d => d.toObject()), [vie, shs, terre]);
        });

        it('should retrieve domains from additionalUnits', function* () {
            const allDomains = yield additionalUnitsUser.allDomains;
            assert.deepEqual(allDomains.map(d => d.toObject()), [nuclear, vie]);
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
