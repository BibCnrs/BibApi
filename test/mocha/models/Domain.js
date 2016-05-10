import Domain from '../../../lib/models/Domain';
import User from '../../../lib/models/User';
import Institute from '../../../lib/models/Institute';
import Unit from '../../../lib/models/Unit';

describe('model Domain', function () {

    describe('update', function () {
        let user, domain, institute, unit;

        beforeEach(function* () {
            yield fixtureLoader.createDomain({ name: 'vie' });
            domain = (yield Domain.findOne({ name: 'vie' })).toObject();
            yield fixtureLoader.createUser({ username: 'john', password: 'secret', domains: ['vie'] });
            user = (yield User.findOne({ username: 'john' })).toObject();
            institute = yield fixtureLoader.createInstitute({ code: '53', domains: ['vie'] });
            unit = yield fixtureLoader.createUnit({ name: 'my unit', domains: ['vie'] });
        });

        it('should update user.domains, institute.domains and unit.domains when changing domain name', function* () {
            yield Domain.findOneAndUpdate({name: 'vie' }, { name: 'INSB' });

            const updatedDomain = (yield Domain.findOne({ name: 'INSB' })).toObject();

            assert.deepEqual(updatedDomain, {
                ...domain,
                name: 'INSB'
            });

            const updatedUser = (yield User.findOne({ username: 'john' })).toObject();

            assert.deepEqual(updatedUser, {
                ...user,
                domains: [updatedDomain.name]
            });
            const updatedInstitute = (yield Institute.findOne({ code: '53' })).toObject();

            assert.deepEqual(updatedInstitute, {
                ...institute,
                domains: [updatedDomain.name]
            });
            const updatedUnit = (yield Unit.findOne({ name: 'my unit' })).toObject();

            assert.deepEqual(updatedUnit, {
                ...unit,
                domains: [updatedDomain.name]
            });
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });


});
