import Unit from '../../../lib/models/Unit';
import User from '../../../lib/models/User';

describe('model Unit', function () {

    describe('update', function () {
        let user, unit;

        beforeEach(function* () {
            yield fixtureLoader.createUnit({ name: 'hello' });
            unit = (yield Unit.findOne({ name: 'hello' })).toObject();
            yield fixtureLoader.createUser({ username: 'john', unit: 'hello', password: 'secret' });
            user = (yield User.findOne({ username: 'john' })).toObject();
        });

        it('should update user.unit when changing unit name', function* () {
            yield Unit.findOneAndUpdate({name: 'hello' }, { name: 'bye' });

            const updatedUnit = (yield Unit.findOne({ name: 'bye' })).toObject();

            assert.deepEqual(updatedUnit, {
                ...unit,
                name: 'bye'
            });

            const updatedUser = (yield User.findOne({ username: 'john' })).toObject();

            assert.deepEqual(updatedUser, {
                ...user,
                unit: updatedUnit.name
            });
        });


        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });


});
