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
});
