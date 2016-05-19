import Unit from '../../../lib/models/Unit';
import User from '../../../lib/models/User';

describe.only('model Unit', function () {

    describe('update', function () {
        let user, unit;

        beforeEach(function* () {
            yield fixtureLoader.createUnit({ name: 'vie' });
            yield fixtureLoader.createUnit({ name: 'shs' });
            unit = (yield Unit.findOne({ name: 'vie' })).toObject();
            yield fixtureLoader.createUser({ username: 'john', primaryUnit: 'shs', additionalUnits: ['vie'], password: 'secret' });
            user = (yield User.findOne({ username: 'john' })).toObject();
        });

        it('should update user.additionalUnits when changing unit name', function* () {
            yield Unit.findOneAndUpdate({name: 'vie' }, { name: 'life' });

            const updatedUnit = (yield Unit.findOne({ name: 'life' })).toObject();

            assert.deepEqual(updatedUnit, {
                ...unit,
                name: 'life'
            });

            const updatedUser = (yield User.findOne({ username: 'john' })).toObject();

            assert.deepEqual(updatedUser, {
                ...user,
                additionalUnits: [updatedUnit.name]
            });
        });

        it('should update user.primaryUnit when changing unit name', function* () {
            yield Unit.findOneAndUpdate({name: 'shs' }, { name: 'psy' });

            const updatedUser = (yield User.findOne({ username: 'john' })).toObject();

            assert.deepEqual(updatedUser, {
                ...user,
                primaryUnit: 'psy'
            });
        });


        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });


});
