import Institute from '../../../lib/models/Institute';
import User from '../../../lib/models/User';

describe('model Institute', function () {

    describe('update', function () {
        let user, institute;

        beforeEach(function* () {
            yield fixtureLoader.createInstitute({ code: '53', name: 'hello' });
            institute = (yield Institute.findOne({ code: '53' })).toObject();
            yield fixtureLoader.createUser({ username: 'john', institute: '53', password: 'secret' });
            user = (yield User.findOne({ username: 'john' })).toObject();
        });

        it('should update user.institute when changing institute name', function* () {
            yield Institute.findOneAndUpdate({name: 'hello' }, { code: '530' });

            const updatedInstitute = (yield Institute.findOne({ code: '530' })).toObject();

            assert.deepEqual(updatedInstitute, {
                ...institute,
                code: '530'
            });

            const updatedUser = (yield User.findOne({ username: 'john' })).toObject();

            assert.deepEqual(updatedUser, {
                ...user,
                institute: updatedInstitute.code
            });
        });


        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });


});
