import Institute from '../../../lib/models/Institute';
import User from '../../../lib/models/User';

describe('model Domain', function () {

    describe('update', function () {
        let user, institute;

        beforeEach(function* () {
            yield fixtureLoader.createInstitute({ code: '53', name: 'hello' });
            institute = (yield Institute.findOne({ code: '53' })).toObject();
            yield fixtureLoader.createUser({ username: 'john', institute: 'hello', password: 'secret', institutes: ['vie'] });
            user = (yield User.findOne({ username: 'john' })).toObject();
        });

        it('should update user.institute when changing institute name', function* () {
            yield Institute.findOneAndUpdate({name: 'hello' }, { name: 'bye' });

            const updatedInstitute = (yield Institute.findOne({ code: '53' })).toObject();

            assert.deepEqual(updatedInstitute, {
                ...institute,
                name: 'bye'
            });

            const updatedUser = (yield User.findOne({ username: 'john' })).toObject();

            assert.deepEqual(updatedUser, {
                ...user,
                institute: updatedInstitute.name
            });
        });


        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });


});
